"use client";

import { useState } from "react";
import { usePrefs } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/client/session-store";

/** Opens only when the server answers "access_denied" (the ACCESS_CODE env var is set). */
export function AccessCodeDialog() {
  const { t } = usePrefs();
  const open = useSession((state) => state.accessPrompt);
  const setAccessPrompt = useSession((state) => state.setAccessPrompt);
  const setAccessCode = useSession((state) => state.setAccessCode);
  const [code, setCode] = useState("");

  return (
    <Dialog open={open} onOpenChange={setAccessPrompt}>
      <DialogContent className="rounded-2xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">{t.access.title}</DialogTitle>
          <DialogDescription>{t.access.lead}</DialogDescription>
        </DialogHeader>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (code.trim()) setAccessCode(code.trim());
          }}
        >
          <Input
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={t.access.placeholder}
            aria-label={t.access.placeholder}
            className="h-10 rounded-xl"
          />
          <Button type="submit" className="h-10 rounded-xl px-4">
            {t.access.submit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
