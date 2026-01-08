'use server';

import db from "@/lib/db";
import { auth } from "@/auth";

export async function searchFamilies(query: string) {
    const session = await auth();
    // @ts-ignore
    const firmId = session?.user?.firmId;
    if (!firmId) return [];

    const families = await db.familyGroup.findMany({
        where: {
            firmId,
            name: { contains: query, mode: 'insensitive' }
        },
        take: 5
    });

    return families;
}
