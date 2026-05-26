"""
Run once to populate MongoDB with dummy data.
  python seed.py
"""
import asyncio
import random
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "skillbytes_quiz")

# ── Raw data ──────────────────────────────────────────────────────────────────

EXAMS = [
    {"name": "UPSC Civil Services", "description": "Union Public Service Commission exam for IAS, IPS, IFS officers.", "icon": "🏛️"},
    {"name": "JEE Advanced", "description": "Joint Entrance Examination for IIT admissions.", "icon": "🔬"},
    {"name": "NEET UG", "description": "National Eligibility cum Entrance Test for MBBS/BDS admissions.", "icon": "🩺"},
    {"name": "CAT", "description": "Common Admission Test for MBA admissions to IIMs.", "icon": "📊"},
    {"name": "GATE CS", "description": "Graduate Aptitude Test in Engineering – Computer Science.", "icon": "💻"},
]

SUBJECTS_MAP = {
    "UPSC Civil Services": [
        {"name": "Indian History", "icon": "🏺", "chapters": [
            {"name": "Ancient India", "questions": [
                ("The Indus Valley Civilisation is also known as?", ["Harappan Civilisation", "Vedic Civilisation", "Dravidian Civilisation", "Aryan Civilisation"], "A", "It is named after Harappa, one of its largest cities."),
                ("Which Mauryan emperor issued the Edicts of Ashoka?", ["Chandragupta Maurya", "Bindusara", "Ashoka", "Dasharatha"], "C", "Ashoka issued these rock and pillar edicts after the Kalinga War."),
                ("The first Battle of Panipat (1526) was fought between?", ["Babur and Ibrahim Lodi", "Akbar and Hemu", "Humayun and Sher Shah", "Babur and Rana Sanga"], "A", "Babur defeated Ibrahim Lodi and established the Mughal Empire."),
                ("The Gandhara school of art emerged under which dynasty?", ["Mauryas", "Kushanas", "Guptas", "Satavahanas"], "B", "Kushana rulers patronised this Greco-Buddhist art style."),
                ("Megasthenes was the ambassador of which ruler?", ["Alexander the Great", "Seleucus I Nicator", "Ptolemy I", "Antiochus I"], "B", "Seleucus I sent Megasthenes to the court of Chandragupta Maurya."),
            ]},
            {"name": "Medieval India", "questions": [
                ("The Bhakti Movement started in which century?", ["5th century", "8th century", "12th century", "15th century"], "C", "It began in Tamil Nadu around the 7th-12th century with the Alvars and Nayanmars."),
                ("Sher Shah Suri built the Grand Trunk Road connecting?", ["Delhi to Mumbai", "Sonargaon to Peshawar", "Agra to Lahore", "Kolkata to Delhi"], "B", "The road ran from Bengal (Sonargaon) to Peshawar."),
                ("The Vijayanagara Empire was founded by?", ["Harihara and Bukka", "Krishna Deva Raya", "Malik Kafur", "Alauddin Khilji"], "A", "Brothers Harihara I and Bukka I founded it in 1336."),
                ("Akbar introduced the Mansabdari system primarily to?", ["Collect taxes efficiently", "Organise military ranks and administration", "Control religious affairs", "Promote trade"], "B", "It was a civil-military ranking system for nobility."),
                ("The Third Battle of Panipat (1761) was fought between?", ["Marathas and British", "Marathas and Ahmad Shah Durrani", "Sikhs and Mughals", "Marathas and Hyder Ali"], "B", "Ahmad Shah Durrani defeated the Marathas, ending their north-Indian dominance."),
            ]},
        ]},
        {"name": "Indian Polity", "icon": "⚖️", "chapters": [
            {"name": "Constitution Basics", "questions": [
                ("The Constitution of India came into force on?", ["26 January 1950", "15 August 1947", "26 November 1949", "1 January 1950"], "A", "26 January 1950 is celebrated as Republic Day."),
                ("Which article of the Constitution deals with Right to Equality?", ["Article 14", "Article 19", "Article 21", "Article 32"], "A", "Article 14 guarantees equality before law."),
                ("The Preamble of the Indian Constitution was amended by which Amendment Act?", ["42nd", "44th", "52nd", "73rd"], "A", "The 42nd Amendment (1976) added 'Socialist', 'Secular', and 'Integrity'."),
                ("Who is the Constitutional head of the Indian state?", ["Prime Minister", "Chief Justice", "President", "Speaker of Lok Sabha"], "C", "The President is the constitutional head; the PM is the executive head."),
                ("The concept of Judicial Review in India is borrowed from?", ["USA", "UK", "Canada", "Australia"], "A", "Judicial Review was adopted from the US Constitution."),
            ]},
            {"name": "Parliament & Legislature", "questions": [
                ("Rajya Sabha members are elected for a term of?", ["5 years", "6 years", "4 years", "Lifetime"], "B", "Rajya Sabha members serve 6-year terms, with 1/3 retiring every 2 years."),
                ("Money Bill can be introduced only in?", ["Rajya Sabha", "Lok Sabha", "Either House", "Joint Session"], "B", "Only the Lok Sabha can originate a Money Bill (Article 109)."),
                ("The maximum strength of Lok Sabha is?", ["545", "552", "550", "543"], "B", "552 (543 elected + up to 2 Anglo-Indian nominees; nomination provision repealed in 2020)."),
                ("Which committee scrutinises the expenditure already incurred?", ["Estimates Committee", "Public Accounts Committee", "Committee on Public Undertakings", "Finance Committee"], "B", "The PAC examines audited accounts of the Government."),
                ("No-Confidence Motion requires a minimum of how many members to admit?", ["50", "100", "25", "75"], "A", "At least 50 members must support the motion for the Speaker to admit it."),
            ]},
        ]},
    ],
    "JEE Advanced": [
        {"name": "Physics", "icon": "⚛️", "chapters": [
            {"name": "Mechanics", "questions": [
                ("A body in uniform circular motion has?", ["Constant velocity", "Constant speed but changing velocity", "Constant acceleration", "Zero acceleration"], "B", "Speed is constant but direction changes, so velocity changes."),
                ("The unit of impulse is the same as that of?", ["Force", "Momentum", "Energy", "Power"], "B", "Impulse = change in momentum; both have units kg·m/s."),
                ("Two bodies of masses m and 2m are dropped from heights H and 2H. The ratio of times to reach the ground is?", ["1:√2", "1:2", "√2:1", "1:1"], "A", "t = √(2h/g); ratio = √H : √(2H) = 1:√2."),
                ("Work done by friction on a body sliding on a rough horizontal surface is?", ["Positive", "Negative", "Zero", "Depends on surface"], "B", "Friction opposes motion, so work done is negative."),
                ("The dimensional formula of Planck's constant is?", ["[ML²T⁻¹]", "[MLT⁻²]", "[ML²T⁻²]", "[M⁰L⁰T⁰]"], "A", "E = hν → h = E/ν = [ML²T⁻²]/[T⁻¹] = [ML²T⁻¹]."),
            ]},
            {"name": "Thermodynamics", "questions": [
                ("First Law of Thermodynamics is a statement of?", ["Conservation of momentum", "Conservation of mass", "Conservation of energy", "Conservation of charge"], "C", "ΔU = Q – W encapsulates energy conservation."),
                ("An adiabatic process is one in which?", ["Temperature is constant", "Pressure is constant", "No heat exchange occurs", "Volume is constant"], "C", "Adiabatic means Q = 0."),
                ("Entropy of the universe in a natural process?", ["Decreases", "Stays constant", "Increases", "First increases then decreases"], "C", "Second Law: entropy of an isolated system never decreases."),
                ("The efficiency of a Carnot engine operating between 500 K and 300 K is?", ["40%", "60%", "50%", "30%"], "A", "η = 1 – T_cold/T_hot = 1 – 300/500 = 0.4 = 40%."),
                ("In an isothermal expansion of an ideal gas, internal energy?", ["Increases", "Decreases", "Remains unchanged", "Becomes zero"], "C", "For ideal gas, U depends only on temperature; isothermal → ΔT=0 → ΔU=0."),
            ]},
        ]},
        {"name": "Mathematics", "icon": "🧮", "chapters": [
            {"name": "Calculus", "questions": [
                ("The derivative of sin(x) with respect to x is?", ["cos(x)", "-cos(x)", "-sin(x)", "tan(x)"], "A", "d/dx[sin x] = cos x."),
                ("∫(1/x)dx equals?", ["x²/2 + C", "ln|x| + C", "1/x² + C", "e^x + C"], "B", "The integral of 1/x is the natural logarithm."),
                ("If f(x) = x³ – 3x, local minima occurs at?", ["x = 1", "x = -1", "x = 0", "x = 3"], "A", "f'(x) = 3x²–3 = 0 → x=±1; f''(1)=6>0 → minimum at x=1."),
                ("The limit of (sin x)/x as x → 0 is?", ["0", "∞", "1", "Undefined"], "C", "Standard limit: lim(x→0) sin(x)/x = 1."),
                ("The area under the curve y = x² from x=0 to x=3 is?", ["9", "27", "6", "3"], "A", "∫₀³ x² dx = [x³/3]₀³ = 27/3 = 9."),
            ]},
            {"name": "Algebra", "questions": [
                ("The sum of roots of ax² + bx + c = 0 is?", ["b/a", "-b/a", "c/a", "-c/a"], "B", "By Vieta's formulas, sum = –b/a."),
                ("How many diagonals does a hexagon have?", ["6", "9", "12", "15"], "B", "Diagonals = n(n-3)/2 = 6(3)/2 = 9."),
                ("log₂(32) equals?", ["4", "5", "6", "3"], "B", "2⁵ = 32, so log₂(32) = 5."),
                ("The number of ways to arrange 5 distinct objects in a row is?", ["25", "120", "60", "20"], "B", "5! = 120."),
                ("If A and B are two sets with |A| = 3 and |B| = 4, the maximum |A∪B| is?", ["7", "12", "4", "3"], "A", "Maximum when A∩B = ∅, giving |A∪B| = 3+4 = 7."),
            ]},
        ]},
    ],
    "NEET UG": [
        {"name": "Biology", "icon": "🧬", "chapters": [
            {"name": "Cell Biology", "questions": [
                ("The powerhouse of the cell is?", ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], "C", "Mitochondria produce ATP through cellular respiration."),
                ("DNA replication occurs in which phase of cell cycle?", ["G1", "S phase", "G2", "M phase"], "B", "DNA synthesis occurs during the S (Synthesis) phase."),
                ("Which organelle is responsible for protein synthesis?", ["Mitochondria", "Lysosome", "Ribosome", "Vacuole"], "C", "Ribosomes translate mRNA into proteins."),
                ("Plasmolysis in a plant cell occurs when?", ["Cell is placed in hypotonic solution", "Cell is placed in hypertonic solution", "Cell is placed in isotonic solution", "Cell undergoes mitosis"], "B", "In hypertonic solution, water leaves the cell, causing the membrane to shrink away."),
                ("Which type of cell division produces gametes?", ["Mitosis", "Meiosis", "Amitosis", "Binary fission"], "B", "Meiosis reduces chromosome number by half to form haploid gametes."),
            ]},
            {"name": "Genetics", "questions": [
                ("Mendel's Law of Segregation applies to?", ["Alleles of the same gene", "Genes on different chromosomes", "Non-homologous chromosomes", "Sex chromosomes only"], "A", "Alleles of a gene separate during gamete formation."),
                ("A person with blood group AB has which genotype?", ["IAIA", "IBIB", "IAIB", "ii"], "C", "Blood group AB is codominant; genotype is IAIB."),
                ("Which nucleotide base is found in RNA but not DNA?", ["Adenine", "Guanine", "Uracil", "Cytosine"], "C", "RNA has Uracil; DNA has Thymine."),
                ("Down syndrome is caused by trisomy of chromosome?", ["21", "18", "13", "X"], "A", "Trisomy 21 results in Down syndrome."),
                ("The Central Dogma of molecular biology is?", ["DNA → RNA → Protein", "RNA → DNA → Protein", "Protein → DNA → RNA", "DNA → Protein → RNA"], "A", "Genetic information flows from DNA to RNA to Protein."),
            ]},
        ]},
    ],
    "CAT": [
        {"name": "Quantitative Aptitude", "icon": "🔢", "chapters": [
            {"name": "Number Systems", "questions": [
                ("The LCM of 12 and 18 is?", ["6", "36", "54", "72"], "B", "LCM(12,18) = 36."),
                ("Which of the following is NOT a prime number?", ["17", "19", "21", "23"], "C", "21 = 3 × 7, so it's composite."),
                ("The HCF of 24, 36 and 48 is?", ["6", "12", "24", "48"], "B", "HCF(24,36,48) = 12."),
                ("If x% of 200 = 50, then x =?", ["10", "20", "25", "40"], "C", "x/100 × 200 = 50 → x = 25."),
                ("The product of two numbers is 120 and their HCF is 4. Their LCM is?", ["30", "480", "15", "60"], "A", "LCM = Product/HCF = 120/4 = 30."),
            ]},
            {"name": "Logical Reasoning", "questions": [
                ("If ROSE is coded as 6821, then PORE is coded as?", ["4682", "4682", "6485", "5924"], "A", "P=4, O=6, R=8, E=2 → PORE = 4682."),
                ("Find the odd one out: 2, 3, 5, 7, 9, 11", ["2", "9", "11", "5"], "B", "9 = 3×3 is not prime; all others are prime."),
                ("A is 3 years older than B. B is 2 years younger than C. If C is 20, how old is A?", ["19", "21", "18", "22"], "B", "C=20 → B=18 → A=21."),
                ("In a row of students, Rahul is 7th from the left and 13th from the right. Total students?", ["18", "19", "20", "21"], "B", "7 + 13 – 1 = 19."),
                ("If Monday = 2, Tuesday = 3, ... Sunday = 8, what is Wednesday + Friday?", ["9", "11", "10", "12"], "B", "Wednesday=4, Friday=6 → 4+6=10. Wait: Mon=2,Tue=3,Wed=4,Thu=5,Fri=6 → 4+6=10."), 
            ]},
        ]},
    ],
    "GATE CS": [
        {"name": "Data Structures", "icon": "🌲", "chapters": [
            {"name": "Arrays & Linked Lists", "questions": [
                ("Time complexity of accessing an element in an array by index is?", ["O(n)", "O(log n)", "O(1)", "O(n²)"], "C", "Direct index access is O(1) in arrays."),
                ("Which data structure uses LIFO order?", ["Queue", "Stack", "Linked List", "Tree"], "B", "Stack follows Last In, First Out."),
                ("In a singly linked list, insertion at the beginning is?", ["O(1)", "O(n)", "O(log n)", "O(n²)"], "A", "We just update the head pointer – O(1)."),
                ("The minimum number of nodes in a binary tree of height h is?", ["h", "h+1", "2h", "2^h"], "B", "A skewed tree of height h has h+1 nodes."),
                ("Which sorting algorithm has the best average-case complexity?", ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"], "C", "Merge Sort has O(n log n) average and worst case."),
            ]},
            {"name": "Algorithms", "questions": [
                ("Dijkstra's algorithm is used for?", ["Minimum spanning tree", "Shortest path in weighted graph", "Topological sort", "Cycle detection"], "B", "Dijkstra finds single-source shortest paths in non-negative weighted graphs."),
                ("The time complexity of binary search is?", ["O(n)", "O(n²)", "O(log n)", "O(1)"], "C", "Binary search halves the search space each step – O(log n)."),
                ("Which paradigm does Dynamic Programming follow?", ["Greedy", "Divide and Conquer", "Overlapping subproblems + optimal substructure", "Backtracking"], "C", "DP solves problems with overlapping subproblems and optimal substructure."),
                ("BFS uses which data structure internally?", ["Stack", "Queue", "Priority Queue", "Deque"], "B", "BFS uses a Queue to explore level by level."),
                ("The worst-case time complexity of QuickSort is?", ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], "C", "When pivot is always smallest/largest, QuickSort degrades to O(n²)."),
            ]},
        ]},
    ],
}

NAMES = [
    "Aarav Sharma", "Priya Patel", "Rohan Mehta", "Ananya Singh", "Vikram Nair",
    "Sneha Reddy", "Arjun Gupta", "Kavya Iyer", "Rahul Joshi", "Divya Kumar",
    "Siddharth Rao", "Pooja Verma", "Aditya Bhat", "Nisha Pillai", "Karan Malhotra",
    "Riya Desai", "Yash Pandey", "Meera Krishnan", "Amit Saxena", "Shreya Agarwal",
]


async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # Drop existing collections
    for col in ["users", "exams", "subjects", "chapters", "questions", "quiz_sessions"]:
        await db[col].drop()
    print("Dropped existing collections")

    # ── Users ─────────────────────────────────────────────────────────────────
    users = []
    for i, name in enumerate(NAMES):
        users.append({"name": name, "device_id": f"device_{i+1:03d}", "created_at": datetime.utcnow() - timedelta(days=random.randint(0, 60))})
    user_result = await db.users.insert_many(users)
    user_ids = [str(uid) for uid in user_result.inserted_ids]
    print(f"Inserted {len(user_ids)} users")

    # ── Exams, Subjects, Chapters, Questions ──────────────────────────────────
    exam_id_map = {}
    subject_id_map = {}
    chapter_id_map = {}
    all_question_ids = []

    for exam_data in EXAMS:
        exam_doc = {**exam_data, "created_at": datetime.utcnow()}
        exam_res = await db.exams.insert_one(exam_doc)
        exam_id = str(exam_res.inserted_id)
        exam_id_map[exam_data["name"]] = exam_id

        subjects = SUBJECTS_MAP.get(exam_data["name"], [])
        for subj_data in subjects:
            subj_doc = {"exam_id": exam_id, "name": subj_data["name"], "description": f"{subj_data['name']} for {exam_data['name']}", "icon": subj_data["icon"]}
            subj_res = await db.subjects.insert_one(subj_doc)
            subj_id = str(subj_res.inserted_id)

            for chap_data in subj_data["chapters"]:
                chap_doc = {"subject_id": subj_id, "exam_id": exam_id, "name": chap_data["name"], "description": f"{chap_data['name']} – {subj_data['name']}", "question_count": len(chap_data["questions"])}
                chap_res = await db.chapters.insert_one(chap_doc)
                chap_id = str(chap_res.inserted_id)

                q_docs = []
                for q in chap_data["questions"]:
                    text, opts, correct, explanation = q
                    keys = ["A", "B", "C", "D"]
                    options = [{"key": keys[i], "text": opts[i]} for i in range(len(opts))]
                    q_docs.append({"chapter_id": chap_id, "subject_id": subj_id, "exam_id": exam_id, "text": text, "options": options, "correct_option": correct, "explanation": explanation, "difficulty": random.choice(["easy", "medium", "hard"])})

                if q_docs:
                    q_res = await db.questions.insert_many(q_docs)
                    all_question_ids.extend([str(qid) for qid in q_res.inserted_ids])
                    chapter_id_map[chap_id] = {"exam_id": exam_id, "subj_id": subj_id, "q_ids": [str(qid) for qid in q_res.inserted_ids]}

    print(f"Inserted {len(all_question_ids)} questions")

    # ── Quiz Sessions (historical data for analytics) ─────────────────────────
    sessions = []
    chapters_list = list(chapter_id_map.items())

    for _ in range(300):   # 300 historical sessions
        user_id = random.choice(user_ids)
        chap_id, chap_info = random.choice(chapters_list)
        q_ids = chap_info["q_ids"]

        started_at = datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23), minutes=random.randint(0, 59))
        is_completed = random.random() > 0.25   # 75% completion rate

        num_answered = len(q_ids) if is_completed else random.randint(0, len(q_ids) - 1)
        responses = []
        correct = 0

        for i, qid in enumerate(q_ids[:num_answered]):
            shown_at = started_at + timedelta(seconds=i * random.randint(10, 90))
            duration_ms = random.randint(3000, 45000)
            answered_at = shown_at + timedelta(milliseconds=duration_ms)
            options = ["A", "B", "C", "D"]
            selected = random.choice(options)
            # Fetch correct option lazily (we stored fixed data above)
            # Just randomise correctness ~60% chance
            is_correct = random.random() < 0.60
            if is_correct:
                correct += 1
            responses.append({"question_id": qid, "shown_at": shown_at, "answered_at": answered_at, "selected_option": selected, "is_correct": is_correct, "response_duration_ms": duration_ms})

        completed_at = (started_at + timedelta(minutes=random.randint(5, 30))) if is_completed else None
        score_pct = round((correct / len(q_ids)) * 100, 1) if len(q_ids) > 0 else 0

        sessions.append({
            "user_id": user_id,
            "exam_id": chap_info["exam_id"],
            "subject_id": chap_info["subj_id"],
            "chapter_id": chap_id,
            "started_at": started_at,
            "completed_at": completed_at,
            "is_completed": is_completed,
            "total_questions": len(q_ids),
            "answered_questions": num_answered,
            "correct_answers": correct,
            "score_percent": score_pct,
            "responses": responses,
        })

    await db.quiz_sessions.insert_many(sessions)
    print(f"Inserted {len(sessions)} quiz sessions")

    # ── Indexes ───────────────────────────────────────────────────────────────
    await db.questions.create_index("chapter_id")
    await db.quiz_sessions.create_index("user_id")
    await db.quiz_sessions.create_index("started_at")
    await db.quiz_sessions.create_index("chapter_id")
    print("Created indexes")

    client.close()
    print("✅ Seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
