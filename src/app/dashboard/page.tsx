import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/signin');
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    redirect('/profile/setup');
  }

  // Hand the client component a plain-JSON serialisable subset.
  return (
    <DashboardClient
      profile={{
        id: profile.id,
        fullName: profile.fullName,
        degreeProgram: profile.degreeProgram,
        university: profile.university,
        semester: profile.semester,
        cgpa: profile.cgpa,
        skills: profile.skills,
        preferredOpportunityTypes: profile.preferredOpportunityTypes,
        financialNeed: profile.financialNeed,
        locationPreference: profile.locationPreference,
        source: profile.source,
      }}
    />
  );
}
