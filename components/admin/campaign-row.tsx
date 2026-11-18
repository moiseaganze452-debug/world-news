"use client";

import { useTransition } from "react";
import { sendCampaignAction, deleteCampaignAction } from "@/lib/actions/newsletter-actions";
import { formatFullDate } from "@/lib/utils/format-date";

interface CampaignRowData {
  id: string;
  subject: string;
  status: "BROUILLON" | "PROGRAMMEE" | "ENVOYEE";
  recipientCount: number;
  sentAt: Date | null;
}

const STATUS_STYLES: Record<CampaignRowData["status"], string> = {
  BROUILLON: "bg-muted text-muted-foreground",
  PROGRAMMEE: "bg-blue-100 text-blue-700",
  ENVOYEE: "bg-emerald-100 text-emerald-700",
};

export function CampaignRow({ campaign, canManage }: { campaign: CampaignRowData; canManage: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    if (!confirm(`Envoyer « ${campaign.subject} » à tous les abonnés actifs ? Cette action est irréversible.`)) return;
    startTransition(async () => {
      try {
        await sendCampaignAction(campaign.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Échec de l'envoi de la campagne.");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Supprimer la campagne « ${campaign.subject} » ?`)) return;
    startTransition(() => deleteCampaignAction(campaign.id));
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium text-foreground">{campaign.subject}</td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[campaign.status]}`}>
          {campaign.status}
        </span>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{campaign.recipientCount}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {campaign.sentAt ? formatFullDate(campaign.sentAt) : "—"}
      </td>
      {canManage && (
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-3">
            {campaign.status === "BROUILLON" && (
              <button onClick={handleSend} disabled={isPending} className="text-xs text-primary hover:underline disabled:opacity-50">
                {isPending ? "Envoi..." : "Envoyer"}
              </button>
            )}
            <button onClick={handleDelete} disabled={isPending} className="text-xs text-destructive hover:underline disabled:opacity-50">
              Supprimer
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
