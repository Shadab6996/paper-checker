type GradeFeedback = {
  questions: { question: string; marksAwarded: number; marksPossible: number; feedback: string }[];
  overallFeedback: string;
};

export type StudentSubmission = {
  imageUrls: string[];
  submittedAt: string;
  gradeStatus: "ungraded" | "graded" | "approved" | "error";
  aiScore: number | null;
  aiMaxScore: number | null;
  aiFeedback: GradeFeedback | null;
  finalScore: number | null;
  finalFeedback: string | null;
};

export function StudentSubmissionView({ submission }: { submission: StudentSubmission }) {
  const graded = submission.gradeStatus === "approved";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-success/30 bg-success/10 px-6 py-6 text-center">
        <svg
          aria-hidden="true"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-success"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m8 12 3 3 5-6" />
        </svg>
        <div>
          <p className="font-semibold text-foreground">Turned in</p>
          <p className="text-sm text-muted-foreground">
            {submission.imageUrls.length} photo{submission.imageUrls.length === 1 ? "" : "s"}{" "}
            submitted{" "}
            {new Date(submission.submittedAt).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {submission.imageUrls.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt={`Page ${i + 1} of your submission`}
            className="aspect-[3/4] w-full rounded-xl border border-border bg-muted object-cover"
          />
        ))}
      </div>

      {graded ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border p-5">
          <p className="text-lg font-bold text-foreground">
            Your grade: {submission.finalScore}
            {submission.aiMaxScore != null ? ` / ${submission.aiMaxScore}` : ""}
          </p>

          {submission.aiFeedback && submission.aiFeedback.questions.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">Q</th>
                    <th className="px-3 py-2 font-semibold">Marks</th>
                    <th className="px-3 py-2 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {submission.aiFeedback.questions.map((q, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-medium text-foreground">{q.question}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                        {q.marksAwarded}/{q.marksPossible}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{q.feedback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Feedback</p>
            <p className="whitespace-pre-line text-sm text-foreground">
              {submission.finalFeedback}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Not graded yet — check back later.
        </p>
      )}
    </div>
  );
}
