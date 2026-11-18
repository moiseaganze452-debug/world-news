"use client";

import { useActionState, useState } from "react";
import { ArticleEditor } from "@/components/admin/article-editor";
import type { ArticleFormState } from "@/lib/actions/article-actions";

interface Option {
  id: string;
  label: string;
}

export interface ArticleFormInitialValues {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  categoryId: string;
  subCategoryId?: string;
  authorId: string;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  isSponsored: boolean;
  isBreaking: boolean;
  seoTitle?: string;
  seoDescription?: string;
  tagIds: string[];
}

const initialState: ArticleFormState = {};

export function ArticleForm({
  action,
  categories,
  authors,
  tags,
  initialValues,
  submitLabel,
}: {
  action: (state: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  categories: Option[];
  authors: Option[];
  tags: Option[];
  initialValues?: ArticleFormInitialValues;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [content, setContent] = useState(initialValues?.content ?? "");

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Field label="Titre" error={state.fieldErrors?.title}>
          <input
            name="title"
            defaultValue={initialValues?.title}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </Field>

        <Field label="Résumé" error={state.fieldErrors?.excerpt}>
          <textarea
            name="excerpt"
            defaultValue={initialValues?.excerpt}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </Field>

        <Field label="Contenu" error={state.fieldErrors?.content}>
          <input type="hidden" name="content" value={content} />
          <ArticleEditor initialContent={initialValues?.content} onChange={setContent} />
        </Field>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Référencement (SEO)</h3>
          <div className="space-y-4">
            <Field label="Titre SEO (max 70 caractères)">
              <input
                name="seoTitle"
                defaultValue={initialValues?.seoTitle}
                maxLength={70}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <Field label="Meta description (max 160 caractères)">
              <textarea
                name="seoDescription"
                defaultValue={initialValues?.seoDescription}
                maxLength={160}
                rows={2}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Publication</h3>
          <div className="space-y-4">
            <Field label="Statut">
              <select
                name="status"
                defaultValue={initialValues?.status ?? "BROUILLON"}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="BROUILLON">Brouillon</option>
                <option value="EN_RELECTURE">En relecture</option>
                <option value="PROGRAMME">Programmé</option>
                <option value="PUBLIE">Publié</option>
                <option value="ARCHIVE">Archivé</option>
              </select>
            </Field>

            <Field label="Date de programmation">
              <input
                type="datetime-local"
                name="scheduledAt"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>

            <Field label="Auteur">
              <select
                name="authorId"
                defaultValue={initialValues?.authorId}
                required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sélectionner...</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Catégorie">
              <select
                name="categoryId"
                defaultValue={initialValues?.categoryId}
                required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sélectionner...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tags">
              <select
                name="tagIds"
                multiple
                defaultValue={initialValues?.tagIds}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                size={4}
              >
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Options</h3>
          <div className="space-y-2">
            <Checkbox name="isFeatured" label="À la une" defaultChecked={initialValues?.isFeatured} />
            <Checkbox name="isTrending" label="Tendance" defaultChecked={initialValues?.isTrending} />
            <Checkbox name="isSponsored" label="Sponsorisé" defaultChecked={initialValues?.isSponsored} />
            <Checkbox name="isBreaking" label="Urgent (breaking news)" defaultChecked={initialValues?.isBreaking} />
          </div>
        </div>

        {state.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Enregistrement..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error?.[0] && <p className="text-xs text-destructive">{error[0]}</p>}
    </div>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="rounded border-border" />
      {label}
    </label>
  );
}
