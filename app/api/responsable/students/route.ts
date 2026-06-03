import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: { classId: parseInt(classId, 10) },
      select: {
        studentId: true,
        firstname: true,
        surname: true,
        grades: {
          select: { value: true },
        },
      },
      orderBy: { surname: 'asc' },
    });

    const result = students.map(student => {
      const values = student.grades.map(g => g.value);
      const globalAverage = values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : null;
      return {
        studentId: Number(student.studentId),
        firstname: student.firstname,
        surname: student.surname,
        globalAverage,
      };
    });

    return NextResponse.json({ students: result });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
