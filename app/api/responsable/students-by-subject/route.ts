/**
 * app/api/responsable/students-by-subject/route.ts
 * API pour récupérer les étudiants ayant des notes dans une matière
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json(
        { error: 'subjectId is required' },
        { status: 400 }
      );
    }

    const grades = await prisma.grade.findMany({
      where: {
        subjectId: parseInt(subjectId, 10),
      },
      select: {
        student: {
          select: {
            studentId: true,
            firstname: true,
            surname: true,
            email: true,
          },
        },
        value: true,
      },
      orderBy: {
        student: { surname: 'asc' },
      },
      distinct: ['studentId'],
    });

    const students = grades.map(grade => ({
      studentId: grade.student.studentId,
      firstname: grade.student.firstname,
      surname: grade.student.surname,
      email: grade.student.email,
      grade: grade.value,
    }));

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students by subject:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
