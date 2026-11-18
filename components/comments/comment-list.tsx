import { prisma } from "@/lib/db/prisma";
import { formatFullDate } from "@/lib/utils/format-date";

export async function CommentList({ articleId }: { articleId: string }) {
  const comments = await prisma.comment.findMany({
    where: { articleId, status: "APPROUVE", parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      replies: {
        where: { status: "APPROUVE" },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">Soyez le premier à commenter cet article.</p>;
  }

  return (
    <ul className="space-y-6">
      {comments.map((comment) => (
        <li key={comment.id}>
          <CommentItem
            authorName={comment.guestName ?? "Anonyme"}
            content={comment.content}
            date={comment.createdAt}
          />
          {comment.replies.length > 0 && (
            <ul className="ml-8 mt-3 space-y-3 border-l border-border pl-4">
              {comment.replies.map((reply) => (
                <li key={reply.id}>
                  <CommentItem
                    authorName={reply.guestName ?? "Anonyme"}
                    content={reply.content}
                    date={reply.createdAt}
                  />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function CommentItem({
  authorName,
  content,
  date,
}: {
  authorName: string;
  content: string;
  date: Date;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{authorName}</span>
        <span className="text-xs text-muted-foreground">{formatFullDate(date)}</span>
      </div>
      <p className="mt-1 text-sm text-foreground/90">{content}</p>
    </div>
  );
}
