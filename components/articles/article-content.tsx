interface ContentNode {
  type: string;
  content?: ContentNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string }[];
}

/**
 * Rendu serveur (sans dépendance Tiptap côté lecture) du contenu JSON
 * produit par l'éditeur riche admin. Volontairement simple : gère les
 * blocs de base (§9). Étendre au fur et à mesure des besoins de l'éditeur.
 */
export function ArticleContent({ content }: { content: string }) {
  let doc: ContentNode;
  try {
    doc = JSON.parse(content);
  } catch {
    // Contenu legacy ou texte brut : on l'affiche tel quel dans un paragraphe.
    return <p className="leading-relaxed text-foreground/90">{content}</p>;
  }

  return (
    <div className="prose prose-neutral max-w-none space-y-4">
      {(doc.content ?? []).map((node, index) => (
        <RenderNode key={index} node={node} />
      ))}
    </div>
  );
}

function RenderNode({ node }: { node: ContentNode }) {
  switch (node.type) {
    case "paragraph":
      return <p className="leading-relaxed text-foreground/90">{renderInline(node.content)}</p>;
    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const Tag = (`h${level}` as unknown) as "h2";
      return <Tag className="font-heading font-bold text-foreground">{renderInline(node.content)}</Tag>;
    }
    case "blockquote":
      return (
        <blockquote className="border-l-4 border-secondary pl-4 italic text-muted-foreground">
          {(node.content ?? []).map((child, i) => (
            <RenderNode key={i} node={child} />
          ))}
        </blockquote>
      );
    case "bulletList":
      return (
        <ul className="list-disc space-y-1 pl-6">
          {(node.content ?? []).map((child, i) => (
            <li key={i}>{renderInline(child.content?.[0]?.content)}</li>
          ))}
        </ul>
      );
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={node.attrs?.src as string}
          alt={(node.attrs?.alt as string) ?? ""}
          className="rounded-lg"
        />
      );
    default:
      return null;
  }
}

function renderInline(nodes?: ContentNode[]): string {
  if (!nodes) return "";
  return nodes.map((n) => n.text ?? "").join("");
}
