-- AddForeignKey
ALTER TABLE "institutional_contexts" ADD CONSTRAINT "institutional_contexts_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

