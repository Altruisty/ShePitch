'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Ticket,
  AlertCircle,
  Award,
  X,
} from 'lucide-react';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function ConferencePage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    college_name: '',
    department: '',
    year_of_study: '1st Year',
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedPromotional, setAcceptedPromotional] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!acceptedTerms || !acceptedPrivacy || !acceptedPromotional) {
      setErrorMsg('Please review and check all required consent boxes (Privacy, Promotional Consent, and Terms & Conditions) to proceed.');
      setLoading(false);
      return;
    }

    if (!formData.college_name || formData.college_name.trim() === '') {
      setErrorMsg('Please enter your College / Institution Name.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/conference/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          college_name: formData.college_name,
          department: formData.department,
          year_of_study: formData.year_of_study,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit conference registration.');
      }

      setSuccessData(data.registration);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="she-category-tag bg-green-50 text-green-700 border-green-200 text-xs">
            FREE REGISTRATION
          </span>
          <span className="she-category-tag bg-purple-50 text-purple-700 border-purple-200 text-xs">
            SINGLE PERSON REGISTRATION
          </span>
        </div>

        <AnimatedTitle
          text="ShePitch Conference Chennai Edition Registration"
          gradientWords={['Conference', 'Chennai', 'Edition']}
          mobileBreakWords={['Conference', 'Chennai']}
          className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight"
        />

        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
          Join 1500+ attendees, 80+ industry mentors, and women leaders for keynotes, panel discussions, and tech innovation showcases.
        </p>

      </div>

      {/* Terms & Conditions Popup Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fade-in max-h-[85vh] flex flex-col border border-purple-100">
            <button
              type="button"
              onClick={() => setIsTermsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-100 pb-3">
              <span className="she-category-tag text-xs">Official Declaration</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">ShePitch Chennai — Terms & Conditions</h3>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs sm:text-sm text-gray-600 pr-2 leading-relaxed">
              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">1. Data Authenticity & Voluntary Submission</span>
                <p>
                  I hereby declare that all submitted information (team name, student leader & member details, college name, email addresses, phone numbers, and pitch proposals) is authentic, accurate, and submitted voluntarily by our team. Submission of false, misleading or fraudulent information may result in disqualification.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900 block text-sm">2. Data Privacy & Encryption Security</span>
                </div>
                <p>
                  All participant data submitted during registration is strictly secured, protected, and handled confidentially with end-to-end data security. No personal data will be shared with unauthorized third parties.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900 block text-sm">3. Joint Promotional Consent (UGHAM & icebrkr)</span>
                </div>
                <p>
                  I consent to receive official event updates, competition announcements, schedule alerts, and promotional communications via email, SMS, or phone from both UGHAM and icebrkr using the provided contact details.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">4. 1-Year Free icebrkr Testing Platform Access</span>
                <p>
                  As an exclusive participant benefit, all registered team members will receive 1 Year of Free Access to icebrkr's product testing platform upon official application launch.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">5. Student Eligibility & Team Composition</span>
                <p>
                  All team members must be enrolled female students from an accredited university or college. Teams must consist of 2 to 4 members with 1 designated student team leader.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">6. Intellectual Property Rights</span>
                <p>
                  Participants retain 100% full ownership of their ideas, pitch decks, software code, hardware models, and project materials submitted during the competition.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">7. Media & Event Showcase Rights</span>
                <p>
                  ShePitch, UGHAM, and icebrkr reserve the right to publish non-confidential project titles, team photographs, and event highlights for national media releases and publicity.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">8. Code of Conduct & Academic Integrity</span>
                <p>
                  Teams agree to maintain original work, fair play, and professional conduct. Plagiarism or fraudulent claims will result in immediate disqualification without refund.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">9. Secure Payment Processing & Non-Refundable Fee</span>
                <p>
                  All transactions are securely processed via Razorpay gateway. Registration fees are non-refundable once an official team receipt is issued, except in case of event cancellation.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">10. Role of icebrkr & Limitation of Liability</span>
                <p>
                  icebrkr is participating solely as a sponsor and ecosystem partner and is not the organiser or administrator of the event. icebrkr shall not be responsible or liable for matters relating to registration, payments, participant selection, judging, prizes, venue, scheduling, cancellation, event operations or any other decisions or activities controlled by the event organiser. To the maximum extent permitted by applicable law, icebrkr shall not be liable for any loss, damage, claim, cost or expense arising from participation in or conduct of the event, except to the extent directly caused by icebrkr’s own acts or omissions.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">11. Grand Finale Attendance & Final Evaluation</span>
                <p>
                  Shortlisted finalists agree to present their pitch live at Jeppiaar University, Chennai on 19 September 2026. All evaluations and award decisions made by the official judging panel are final.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">12. Confidentiality / Disclosure</span>
                <p>
                  Participants should understand that they are responsible for deciding what confidential information they disclose during a public pitch. The organisers should not be responsible for protecting information that participants voluntarily disclose publicly.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">13. Event Modification, Rescheduling & Cancellation Rights</span>
                <p>
                  The organisers have the right to modify, reschedule, change the judging panel, competition format or eligibility criteria ..also cancel or postpone the event where necessary with prior information.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setAcceptedTerms(true);
                  setAcceptedPrivacy(true);
                  setAcceptedPromotional(true);
                  setIsTermsModalOpen(false);
                }}
                className="w-full she-btn-primary justify-center text-xs sm:text-sm py-3.5 font-extrabold uppercase tracking-wider"
              >
                I Agree & Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL / VIEW */}
      {successData ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-green-200 shadow-2xl space-y-6 text-center relative overflow-hidden"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-green-100 text-green-800 text-xs font-black uppercase px-3 py-1 rounded-full">
              Registration Confirmed #CONF-{String(successData.id).padStart(4, '0')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Welcome to ShePitch Conference, {successData.full_name}!
            </h2>
            <p className="text-gray-600 text-sm max-w-lg mx-auto">
              A official confirmation email with your registration details has been sent to{' '}
              <strong className="text-gray-900">{successData.email}</strong>.
            </p>
          </div>

          {/* Registration Pass Card */}
          <div className="bg-gradient-to-br from-[#1e0d2e] via-[#6C3B8F] to-[#E83E8C] text-white p-6 sm:p-8 rounded-2xl text-left shadow-xl space-y-6 relative overflow-hidden border border-purple-300/30">
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-200 block">
                  OFFICIAL REGISTRATION PASS
                </span>
                <h3 className="text-lg sm:text-xl font-black">ShePitch Conference Chennai</h3>
              </div>
              <Ticket className="w-8 h-8 text-yellow-300 opacity-90" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-purple-200 block text-[11px]">ATTENDEE NAME</span>
                <span className="font-extrabold text-base">{successData.full_name}</span>
              </div>
              <div>
                <span className="text-purple-200 block text-[11px]">PHONE</span>
                <span className="font-bold">{successData.phone}</span>
              </div>
              <div>
                <span className="text-purple-200 block text-[11px]">INSTITUTION / COLLEGE</span>
                <span className="font-bold">{successData.college_name}</span>
              </div>
              <div>
                <span className="text-purple-200 block text-[11px]">DEPARTMENT & YEAR</span>
                <span className="font-bold">
                  {successData.department} ({successData.year_of_study})
                </span>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-purple-100 font-medium">
              <span>📅 19 September 2026</span>
              <span>📍 Jeppiaar University, Chennai</span>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-white font-bold">Free Entry Pass</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="she-btn-primary py-3.5 px-8 text-sm uppercase tracking-wider font-extrabold"
            >
              Print / Save Registration Pass
            </button>
            <Link
              href="/"
              className="text-xs font-extrabold text-[#6C3B8F] hover:underline uppercase tracking-wider"
            >
              Return to Homepage &rarr;
            </Link>
          </div>
        </motion.div>
      ) : (
        /* REGISTRATION FORM */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xl space-y-8"
        >
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Single Person Conference Registration Form
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Please fill in your details to receive your free registration pass & confirmation mail.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Full Name */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#6C3B8F]" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] focus:bg-white transition-all font-medium text-gray-900"
                />
              </div>

              {/* 2. Email Address */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#6C3B8F]" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] focus:bg-white transition-all font-medium text-gray-900"
                />
              </div>

              {/* 3. Contact Phone */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#6C3B8F]" />
                  <span>Contact Phone Number *</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] focus:bg-white transition-all font-medium text-gray-900"
                />
              </div>

              {/* 4. College Name (Manual Input) */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#6C3B8F]" />
                  <span>College / Institution Name *</span>
                </label>
                <input
                  type="text"
                  name="college_name"
                  required
                  placeholder="Enter your college or institution name"
                  value={formData.college_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] focus:bg-white transition-all font-medium text-gray-900"
                />
              </div>

              {/* 5. Department */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#6C3B8F]" />
                  <span>Department *</span>
                </label>
                <input
                  type="text"
                  name="department"
                  required
                  placeholder="e.g. Computer Science, ECE, Design, MBA"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] focus:bg-white transition-all font-medium text-gray-900"
                />
              </div>

              {/* 6. Year of Study */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#6C3B8F]" />
                  <span>Year of Study / Status *</span>
                </label>
                <select
                  name="year_of_study"
                  value={formData.year_of_study}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] focus:bg-white transition-all font-medium text-gray-900 cursor-pointer"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Post Graduate (PG)">Post Graduate (PG)</option>
                  <option value="Faculty / Educator">Faculty / Educator</option>
                  <option value="Industry Professional / Other">Industry Professional / Other</option>
                </select>
              </div>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              {/* Checkbox 1: Data Privacy & Encryption Security (Point 2) */}
              <div className="flex items-start gap-3 p-3.5 bg-purple-50/40 rounded-2xl border border-purple-100/80">
                <input
                  type="checkbox"
                  id="conf_privacy_checkbox"
                  required
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#6C3B8F] border-gray-300 rounded focus:ring-[#6C3B8F] cursor-pointer accent-[#6C3B8F] shrink-0"
                />
                <label htmlFor="conf_privacy_checkbox" className="text-xs sm:text-sm text-gray-700 leading-relaxed cursor-pointer font-medium select-none">
                  <strong>Data Privacy & Encryption Security:</strong> All participant data submitted during registration is strictly secured, protected, and handled confidentially with end-to-end data security. No personal data will be shared with unauthorized third parties. *
                </label>
              </div>

              {/* Checkbox 2: Joint Promotional Consent (Point 3) */}
              <div className="flex items-start gap-3 p-3.5 bg-purple-50/40 rounded-2xl border border-purple-100/80">
                <input
                  type="checkbox"
                  id="conf_promotional_checkbox"
                  required
                  checked={acceptedPromotional}
                  onChange={(e) => setAcceptedPromotional(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#6C3B8F] border-gray-300 rounded focus:ring-[#6C3B8F] cursor-pointer accent-[#6C3B8F] shrink-0"
                />
                <label htmlFor="conf_promotional_checkbox" className="text-xs sm:text-sm text-gray-700 leading-relaxed cursor-pointer font-medium select-none">
                  <strong>Joint Promotional Consent (UGHAM & icebrkr):</strong> I consent to receive official event updates, competition announcements, schedule alerts, and promotional communications via email, SMS, or phone from both <strong>UGHAM</strong> and <strong>icebrkr</strong> using the provided contact details. *
                </label>
              </div>

              {/* Checkbox 3: General Terms & Conditions */}
              <div className="flex items-start gap-3 p-3.5 bg-purple-50/40 rounded-2xl border border-purple-100/80">
                <input
                  type="checkbox"
                  id="conf_terms_checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#6C3B8F] border-gray-300 rounded focus:ring-[#6C3B8F] cursor-pointer accent-[#6C3B8F] shrink-0"
                />
                <label htmlFor="conf_terms_checkbox" className="text-xs sm:text-sm text-gray-700 leading-relaxed cursor-pointer font-medium select-none">
                  I certify that all details submitted are accurate and I accept all 13 points of the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTermsModalOpen(true);
                    }}
                    className="text-[#6C3B8F] font-extrabold underline hover:text-[#5a2e7a] inline-flex items-center gap-0.5"
                  >
                    Terms & Conditions
                  </button>
                  . *
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full she-btn-primary justify-center py-4 text-base font-black uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-[#6C3B8F]/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Delegate...</span>
              ) : (
                <>
                  <span>Complete Free Registration</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
