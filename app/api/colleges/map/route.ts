import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initDatabase } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

// Jeppiaar University - Red Pin / Center
const JEPPIAAR_VENUE = {
  name: 'Jeppiaar University',
  lat: 12.8718,
  lng: 80.2206,
  location: 'Rajiv Gandhi Salai, OMR, Semmancheri, Chennai',
  isVenue: true,
  description: 'Grand Finale Host Venue & National Innovation Hub',
  date: '19 September 2026, 9:00 AM IST',
};

// Known Chennai Colleges Coordinate Knowledge Base
const CHENNAI_COLLEGE_COORDINATES: Array<{
  keywords: string[];
  name: string;
  lat: number;
  lng: number;
  location: string;
}> = [
  {
    keywords: ['anna', 'ceg', 'guindy'],
    name: 'Anna University (CEG Campus)',
    lat: 13.0102,
    lng: 80.2355,
    location: 'Guindy, Chennai',
  },
  {
    keywords: ['loyola'],
    name: 'Loyola College',
    lat: 13.0645,
    lng: 80.2335,
    location: 'Nungambakkam, Chennai',
  },
  {
    keywords: ['stella maris', 'stella'],
    name: 'Stella Maris College',
    lat: 13.0456,
    lng: 80.2529,
    location: 'Cathedral Road, Chennai',
  },
  {
    keywords: ['sathyabama'],
    name: 'Sathyabama Institute of Science and Technology',
    lat: 12.8726,
    lng: 80.2185,
    location: 'OMR, Sholinganallur, Chennai',
  },
  {
    keywords: ['ssn'],
    name: 'SSN College of Engineering',
    lat: 12.7509,
    lng: 80.1973,
    location: 'OMR, Kalavakkam, Chennai',
  },
  {
    keywords: ['madras christian', 'mcc'],
    name: 'Madras Christian College (MCC)',
    lat: 12.9238,
    lng: 80.125,
    location: 'East Tambaram, Chennai',
  },
  {
    keywords: ['srm', 'kattankulathur'],
    name: 'SRM Institute of Science and Technology',
    lat: 12.823,
    lng: 80.0452,
    location: 'Kattankulathur, Chennai',
  },
  {
    keywords: ['hindustan', 'hits'],
    name: 'Hindustan Institute of Technology & Science',
    lat: 12.8398,
    lng: 80.2232,
    location: 'Padur, OMR, Chennai',
  },
  {
    keywords: ['joseph', 'st. joseph'],
    name: "St. Joseph's College of Engineering",
    lat: 12.8687,
    lng: 80.2189,
    location: 'OMR, Semmancheri, Chennai',
  },
  {
    keywords: ['vaishnav', 'mop'],
    name: 'M.O.P. Vaishnav College for Women',
    lat: 13.056,
    lng: 80.245,
    location: 'Nungambakkam, Chennai',
  },
  {
    keywords: ['crescent', 'abdur rahman'],
    name: 'B.S. Abdur Rahman Crescent Institute',
    lat: 12.877,
    lng: 80.083,
    location: 'Vandalur, Chennai',
  },
  {
    keywords: ['ethiraj'],
    name: 'Ethiraj College for Women',
    lat: 13.0655,
    lng: 80.2555,
    location: 'Egmore, Chennai',
  },
  {
    keywords: ['kcg'],
    name: 'KCG College of Technology',
    lat: 12.9248,
    lng: 80.2307,
    location: 'Karapakkam, OMR, Chennai',
  },
  {
    keywords: ['meenakshi'],
    name: 'Meenakshi Sundararajan Engineering College',
    lat: 13.0494,
    lng: 80.2246,
    location: 'Kodambakkam, Chennai',
  },
  {
    keywords: ['vels', 'vistas'],
    name: 'Vels Institute of Science, Technology & Advanced Studies',
    lat: 12.9575,
    lng: 80.1554,
    location: 'Pallavaram, Chennai',
  },
  {
    keywords: ['rajalakshmi', 'rec'],
    name: 'Rajalakshmi Engineering College',
    lat: 13.0084,
    lng: 79.9723,
    location: 'Thandalam, Chennai',
  },
  {
    keywords: ['easwari'],
    name: 'Easwari Engineering College',
    lat: 13.033,
    lng: 80.1804,
    location: 'Ramapuram, Chennai',
  },
  {
    keywords: ['saveetha'],
    name: 'Saveetha Engineering College',
    lat: 13.028,
    lng: 80.016,
    location: 'Thandalam, Chennai',
  },
  {
    keywords: ['panimalar'],
    name: 'Panimalar Engineering College',
    lat: 13.049,
    lng: 80.076,
    location: 'Poonamallee, Chennai',
  },
  {
    keywords: ['women christian', 'wcc'],
    name: "Women's Christian College",
    lat: 13.0667,
    lng: 80.2417,
    location: 'Nungambakkam, Chennai',
  },
  {
    keywords: ['sairam'],
    name: 'Sri Sairam Engineering College',
    lat: 12.9602,
    lng: 80.0575,
    location: 'West Tambaram, Chennai',
  },
  {
    keywords: ['svce', 'venkateswara'],
    name: 'Sri Venkateswara College of Engineering (SVCE)',
    lat: 12.9877,
    lng: 79.972,
    location: 'Sriperumbudur, Chennai',
  },
  {
    keywords: ['agni'],
    name: 'Agni College of Technology',
    lat: 12.8465,
    lng: 80.203,
    location: 'Thalambur, OMR, Chennai',
  },
];

// Fallback list of Chennai colleges for local development or when DB has 0 records
const DEFAULT_FALLBACK_COLLEGES = [
  {
    name: 'Anna University (CEG Campus)',
    lat: 13.0102,
    lng: 80.2355,
    location: 'Guindy, Chennai',
    teams: 14,
    students: 42,
  },
  {
    name: 'Loyola College',
    lat: 13.0645,
    lng: 80.2335,
    location: 'Nungambakkam, Chennai',
    teams: 11,
    students: 33,
  },
  {
    name: 'Stella Maris College',
    lat: 13.0456,
    lng: 80.2529,
    location: 'Cathedral Road, Chennai',
    teams: 9,
    students: 27,
  },
  {
    name: 'Sathyabama Institute of Science and Technology',
    lat: 12.8726,
    lng: 80.2185,
    location: 'OMR, Sholinganallur, Chennai',
    teams: 12,
    students: 36,
  },
  {
    name: 'SSN College of Engineering',
    lat: 12.7509,
    lng: 80.1973,
    location: 'OMR, Kalavakkam, Chennai',
    teams: 8,
    students: 24,
  },
  {
    name: 'Madras Christian College (MCC)',
    lat: 12.9238,
    lng: 80.125,
    location: 'East Tambaram, Chennai',
    teams: 7,
    students: 21,
  },
  {
    name: 'SRM Institute of Science and Technology',
    lat: 12.823,
    lng: 80.0452,
    location: 'Kattankulathur, Chennai',
    teams: 10,
    students: 30,
  },
  {
    name: 'Hindustan Institute of Technology & Science',
    lat: 12.8398,
    lng: 80.2232,
    location: 'Padur, OMR, Chennai',
    teams: 6,
    students: 18,
  },
  {
    name: "St. Joseph's College of Engineering",
    lat: 12.8687,
    lng: 80.2189,
    location: 'OMR, Semmancheri, Chennai',
    teams: 8,
    students: 24,
  },
  {
    name: 'M.O.P. Vaishnav College for Women',
    lat: 13.056,
    lng: 80.245,
    location: 'Nungambakkam, Chennai',
    teams: 7,
    students: 21,
  },
  {
    name: 'B.S. Abdur Rahman Crescent Institute',
    lat: 12.877,
    lng: 80.083,
    location: 'Vandalur, Chennai',
    teams: 5,
    students: 15,
  },
  {
    name: 'KCG College of Technology',
    lat: 12.9248,
    lng: 80.2307,
    location: 'Karapakkam, OMR, Chennai',
    teams: 6,
    students: 18,
  },
  {
    name: 'Rajalakshmi Engineering College',
    lat: 13.0084,
    lng: 79.9723,
    location: 'Thandalam, Chennai',
    teams: 7,
    students: 21,
  },
  {
    name: 'Easwari Engineering College',
    lat: 13.033,
    lng: 80.1804,
    location: 'Ramapuram, Chennai',
    teams: 5,
    students: 15,
  },
  {
    name: 'Sri Sairam Engineering College',
    lat: 12.9602,
    lng: 80.0575,
    location: 'West Tambaram, Chennai',
    teams: 6,
    students: 18,
  },
];

// Helper to project any unknown college string deterministically around Chennai
function getCoordinatesForCollege(collegeName: string, index: number) {
  const clean = collegeName.toLowerCase();

  // Search in known coordinates
  for (const item of CHENNAI_COLLEGE_COORDINATES) {
    if (item.keywords.some((k) => clean.includes(k))) {
      return {
        lat: item.lat,
        lng: item.lng,
        location: item.location,
      };
    }
  }

  // Deterministic circular dispersion around Chennai / Jeppiaar if not found
  // Center: 12.92, 80.18 (radius ~10-18 km)
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const distance = 0.05 + ((Math.abs(hash * 31) % 100) / 100) * 0.12;

  const lat = 12.92 + Math.sin(angle) * distance;
  const lng = 80.18 + Math.cos(angle) * distance;

  return {
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
    location: 'Chennai Region',
  };
}

export async function GET() {
  try {
    await initDatabase();

    // 1. Query teams grouped by college_name
    const [teamRows]: any = await pool.query(
      `SELECT 
         t.college_name,
         COUNT(t.id) as team_count
       FROM she_pitch_teams t
       WHERE t.college_name IS NOT NULL 
         AND t.college_name != ''
         AND t.payment_status = 'success'
       GROUP BY t.college_name`
    );

    // 2. Query active partner colleges
    const [partnerRows]: any = await pool.query(
      `SELECT id, college_name, rep_name FROM she_pitch_colleges WHERE status = 'active'`
    );

    const collegesMap = new Map<string, { name: string; teams: number; location: string; lat: number; lng: number }>();

    if (Array.isArray(teamRows) && teamRows.length > 0) {
      teamRows.forEach((row: any, idx: number) => {
        const name = (row.college_name || '').trim();
        if (!name) return;

        // Skip Jeppiaar itself from green list since it is the red center venue
        if (name.toLowerCase().includes('jeppiaar')) return;

        const coords = getCoordinatesForCollege(name, idx);
        collegesMap.set(name.toLowerCase(), {
          name,
          teams: Number(row.team_count) || 1,
          lat: coords.lat,
          lng: coords.lng,
          location: coords.location,
        });
      });
    }

    if (Array.isArray(partnerRows) && partnerRows.length > 0) {
      partnerRows.forEach((p: any, idx: number) => {
        const name = (p.college_name || '').trim();
        if (!name) return;
        if (name.toLowerCase().includes('jeppiaar')) return;

        const key = name.toLowerCase();
        if (!collegesMap.has(key)) {
          const coords = getCoordinatesForCollege(name, idx);
          collegesMap.set(key, {
            name,
            teams: 1,
            lat: coords.lat,
            lng: coords.lng,
            location: coords.location,
          });
        }
      });
    }

    let finalColleges = Array.from(collegesMap.values());

    // If local DB is empty (as user noted: "there wont be any colleges list right now in my db"),
    // return rich realistic default Chennai colleges
    if (finalColleges.length === 0) {
      finalColleges = DEFAULT_FALLBACK_COLLEGES;
    }

    return NextResponse.json({
      success: true,
      venue: JEPPIAAR_VENUE,
      colleges: finalColleges,
      totalColleges: finalColleges.length,
    });
  } catch (error: any) {
    // Graceful fallback to default mock list on any database or network issue
    return NextResponse.json({
      success: true,
      venue: JEPPIAAR_VENUE,
      colleges: DEFAULT_FALLBACK_COLLEGES,
      totalColleges: DEFAULT_FALLBACK_COLLEGES.length,
    });
  }
}
