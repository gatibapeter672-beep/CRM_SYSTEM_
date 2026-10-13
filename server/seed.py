#!/usr/bin/env python3
import random
from datetime import datetime, timedelta, timezone

# Added TeacherClass to imports
from app import app, db
from models.class_model import SchoolClass
from models.class_subject import ClassSubject
from models.download import Download
from models.resource_tag import ResourceTag
from models.resource_view import ResourceView
from models.resource import Resource
from models.role import Role
from models.subject import Subject
from models.tag import Tag
from models.user import User
from models.student_class import StudentClass
from models.teacher_class import TeacherClass  # <-- New Import

def seed_database():
    print("Deleting existing data...")
    db.session.query(Download).delete()
    db.session.query(ResourceView).delete()
    db.session.query(ResourceTag).delete()
    db.session.query(Resource).delete()
    db.session.query(ClassSubject).delete()
    db.session.query(Tag).delete()
    db.session.query(Subject).delete()
    db.session.query(StudentClass).delete()
    db.session.query(TeacherClass).delete()    # <-- Added to teardown
    db.session.query(SchoolClass).delete()
    db.session.query(User).delete()
    db.session.query(Role).delete()
    db.session.commit()

    print("Creating roles...")
    admin_role = Role(role_name="admin", description="System administrator with full access.")
    teacher_role = Role(role_name="teacher", description="Can upload and manage resources.")
    student_role = Role(role_name="student", description="Can view and download resources.")
    db.session.add_all([admin_role, teacher_role, student_role])
    db.session.commit()

    print("Creating users...")
    admin = User(
        first_name="Jane",
        last_name="Doe",
        email="admin@school.com",
        role=admin_role
    )
    admin.password = "admin123"

    teachers = []
    teacher_data = [
        ("Albert", "Einstein", "physics.albert@school.com"),
        ("Ada", "Lovelace", "ada.codes@school.com"),
        ("Marie", "Curie", "marie.c@school.com")
    ]
    for first, last, email in teacher_data:
        t = User(first_name=first, last_name=last, email=email, role=teacher_role)
        t.password = "teacher123"
        teachers.append(t)
        db.session.add(t)

    students = []
    student_data = [
        ("John", "Doe", "john.doe@student.com"),
        ("Alice", "Smith", "alice.s@student.com"),
        ("Bob", "Jones", "bob.j@student.com")
    ]
    for first, last, email in student_data:
        s = User(first_name=first, last_name=last, email=email, role=student_role)
        s.password = "student123"
        students.append(s)
        db.session.add(s)

    db.session.add(admin)
    db.session.commit()

    print("Creating classes...")
    class_names = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"]
    classes = []
    for name in class_names:
        sc = SchoolClass(class_name=name, description=f"Standard curriculum for {name} students.")
        classes.append(sc)
        db.session.add(sc)
    db.session.commit()

    # --- New Section: Assigning Teachers to Classes ---
    print("Assigning teachers to classes...")
    for teacher in teachers:
        # Each teacher gets randomly assigned to 1 to 2 classes
        assigned_classes = random.sample(classes, k=random.randint(1, 2))
        
        for sc in assigned_classes:
            link = TeacherClass(
                teacher=teacher,
                school_class=sc
            )
            db.session.add(link)
    db.session.commit()
    # --------------------------------------------------

    print("Creating subjects...")
    subject_list = [
        ("Mathematics", "MATH101", "Algebra, Geometry, and Calculus basics."),
        ("Physics", "PHYS101", "Classical mechanics, thermodynamics, and optics."),
        ("Chemistry", "CHEM101", "Organic chemistry, reaction dynamics, and periodic trends."),
        ("Computer Science", "COMP101", "Introduction to Python, data structures, and algorithms."),
        ("History", "HIST101", "Modern world history and political revolutions.")
    ]
    subjects = []
    for name, code, desc in subject_list:
        sub = Subject(subject_name=name, subject_code=code, description=desc)
        subjects.append(sub)
        db.session.add(sub)
    db.session.commit()

    print("Mapping subjects to classes...")
    for sc in classes:
        for sub in subjects:
            cs = ClassSubject(school_class=sc, subject=sub)
            db.session.add(cs)
    db.session.commit()

    print("Assigning students to classes...")
    for student in students:
        # each student gets 1–2 classes
        assigned_classes = random.sample(classes, k=random.randint(1, 2))
        
        for sc in assigned_classes:
            link = StudentClass(
                student=student,
                school_class=sc
            )
            db.session.add(link)
    db.session.commit()

    print("Creating tags...")
    tag_names = ["Exam", "Revision", "Cheat Sheet", "Syllabus", "Calculus", "Mechanics", "Programming"]
    tags = []
    for name in tag_names:
        tag = Tag(tag_name=name)
        tags.append(tag)
        db.session.add(tag)
    db.session.commit()

    print("Creating resources...")
    resource_presets = [
        {
            "title": "Algebra Fundamentals Cheat Sheet",
            "description": "A quick-reference formula sheet covering quadratics, sequences, and log rules.",
            "file_name": "algebra_cheat_sheet.pdf",
            "file_path": "/uploads/resources/algebra_cheat_sheet.pdf",
            "file_size": 1024500,
            "file_type": "application/pdf",
            "resource_type": "NOTE",
            "subject_name": "Mathematics"
        },
        {
            "title": "Introduction to Python Programming Assignment",
            "description": "Weekly lab assignments covering loops, lists, and functions.",
            "file_name": "python_assignment_1.docx",
            "file_path": "/uploads/resources/python_assignment_1.docx",
            "file_size": 254000,
            "file_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "resource_type": "ASSIGNMENT",
            "subject_name": "Computer Science"
        },
        {
            "title": "Newtonian Physics Past Paper (2025)",
            "description": "Review paper containing structural questions on Newtonian force and motion laws.",
            "file_name": "physics_past_paper_2025.pdf",
            "file_path": "/uploads/resources/physics_past_paper_2025.pdf",
            "file_size": 4200000,
            "file_type": "application/pdf",
            "resource_type": "PAST_PAPER",
            "subject_name": "Physics"
        },
        {
            "title": "Organic Chemistry Revision Flashcards",
            "description": "Functional groups, naming patterns, and basic reaction mechanisms.",
            "file_name": "chemistry_flashcards.zip",
            "file_path": "/uploads/resources/chemistry_flashcards.zip",
            "file_size": 15400000,
            "file_type": "application/zip",
            "resource_type": "REVISION_QUESTION",
            "subject_name": "Chemistry"
        }
    ]

    resources = []
    for preset in resource_presets:
        target_subject = next(s for s in subjects if s.subject_name == preset["subject_name"])
        target_class = random.choice(classes)
        target_uploader = random.choice(teachers)

        res = Resource(
            title=preset["title"],
            description=preset["description"],
            file_name=preset["file_name"],
            file_path=preset["file_path"],
            file_size=preset["file_size"],
            file_type=preset["file_type"],
            resource_type=preset["resource_type"],
            status="ACTIVE",
            subject=target_subject,
            school_class=target_class,
            uploader=target_uploader
        )
        resources.append(res)
        db.session.add(res)
    db.session.commit()

    print("Tagging resources...")
    for res in resources:
        assigned_tags = random.sample(tags, k=random.randint(1, 3))
        for tag in assigned_tags:
            rt = ResourceTag(resource=res, tag=tag)
            db.session.add(rt)
    db.session.commit()

    print("Generating simulated user views and downloads...")
    for s in students:
        for res in resources:
            if random.random() > 0.2:
                view = ResourceView(
                    user=s,
                    resource=res,
                    viewed_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 10))
                )
                db.session.add(view)
            
            if random.random() > 0.5:
                download = Download(
                    user=s,
                    resource=res,
                    downloaded_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 10))
                )
                db.session.add(download)
    
    db.session.commit()
    print("Database seeded successfully! 🎉")

if __name__ == "__main__":
    with app.app_context():
        seed_database()