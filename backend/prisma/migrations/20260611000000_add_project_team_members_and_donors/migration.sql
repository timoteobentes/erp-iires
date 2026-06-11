-- CreateTable
CREATE TABLE "_DonorToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DonorToProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProjectTeamMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectTeamMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DonorToProject_B_index" ON "_DonorToProject"("B");

-- CreateIndex
CREATE INDEX "_ProjectTeamMembers_B_index" ON "_ProjectTeamMembers"("B");

-- AddForeignKey
ALTER TABLE "_DonorToProject" ADD CONSTRAINT "_DonorToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "donors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DonorToProject" ADD CONSTRAINT "_DonorToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectTeamMembers" ADD CONSTRAINT "_ProjectTeamMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectTeamMembers" ADD CONSTRAINT "_ProjectTeamMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
