import { JobProfile } from "../types/jobProfileTypes";

export const JOB_PROFILES: JobProfile[] = [
  {
    id: 1,
    position: "Senior Ruby on Rails Developer",
    experience: "6+ Years",

    overview: [
      {
        type: "paragraph",
        content: [
          {
            id: "o1",
            text:
              "We are looking for a skilled Ruby on Rails developer to build and maintain scalable backend systems."
          }
        ]
      }
    ],

    responsibilities: {
      type: "bullets",
      content: [
        {
          id: "r1",
          text: "Develop scalable backend services",
          children: [
            { id: "r1.1", text: "Design REST APIs" },
            { id: "r1.2", text: "Optimize database queries" }
          ]
        },
        {
          id: "r2",
          text: "Collaborate with frontend team"
        }
      ]
    },

    requiredSkills: {
      type: "bullets",
      content: [
        { id: "s1", text: "Ruby on Rails" },
        { id: "s2", text: "PostgreSQL" },
        { id: "s3", text: "REST APIs" }
      ]
    }
  },

  {
    id: 2,
    position: "Frontend Engineer (React)",
    experience: "3–5 Years",

    overview: [
      {
        type: "paragraph",
        content: [
          {
            id: "o2",
            text:
              "The Frontend Engineer will focus on building responsive and performant user interfaces using React."
          }
        ]
      }
    ],

    responsibilities: {
      type: "bullets",
      content: [
        {
          id: "r3",
          text: "Build reusable UI components"
        },
        {
          id: "r4",
          text: "Collaborate with backend and design teams"
        }
      ]
    },

    requiredSkills: {
      type: "bullets",
      content: [
        { id: "s4", text: "React" },
        { id: "s5", text: "TypeScript" },
        { id: "s6", text: "HTML & CSS" }
      ]
    }
  },

  {
    id: 3,
    position: "Data Engineer",
    experience: "5+ Years",

    overview: [
      {
        type: "paragraph",
        content: [
          {
            id: "o3",
            text:
              "We are seeking a Data Engineer to design, build, and optimize data pipelines for analytics and reporting."
          }
        ]
      }
    ],

    responsibilities: {
      type: "bullets",
      content: [
        {
          id: "r5",
          text: "Build and maintain ETL pipelines"
        },
        {
          id: "r6",
          text: "Ensure data quality and reliability"
        }
      ]
    },

    requiredSkills: {
      type: "bullets",
      content: [
        { id: "s7", text: "Python" },
        { id: "s8", text: "SQL" },
        { id: "s9", text: "Data Warehousing" }
      ]
    },

    // ✅ Optional section present only here
    niceToHave: {
      type: "bullets",
      content: [
        { id: "n1", text: "Experience with Apache Kafka" },
        { id: "n2", text: "Cloud experience (AWS / GCP)" }
      ]
    }
  }
];
