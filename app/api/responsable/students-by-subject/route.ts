import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json({ error: 'subjectId is required' }, { status: 400 });
    }

    const parsedSubjectId = parseInt(subjectId, 10);

    const students = await prisma.student.findMany({
      where: {
        grades: {
          some: {
            assessment: { subjectId: parsedSubjectId },
          },
        },
      },
      select: {
        studentId: true,
        firstname: true,
        surname: true,
        grades: {
          where: {
            assessment: { subjectId: parsedSubjectId },
          },
          select: { value: true },
        },
      },
      orderBy: { surname: 'asc' },
    });

    const result = students.map(student => {
      const values = student.grades.map(g => g.value);
      const grade = values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : null;
      return {
        studentId: Number(student.studentId),
        firstname: student.firstname,
        surname: student.surname,
        grade,
      };
    });

    return NextResponse.json({ students: result });
  } catch (error) {
    console.error('Error fetching students by subject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
