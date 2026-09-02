'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import {
  Users,
  Building2,
  Mail,
  Phone,
  GraduationCap,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import AnimatedTitle from '@/components/AnimatedTitle';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'Idea Pitch';

  const [registeredColleges, setRegisteredColleges] = useState<any[]>([]);
  const [selectedCollegeOption, setSelectedCollegeOption] = useState('');
  const [collegeId, setCollegeId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    team_name: '',
    category: initialCategory,
    coupon_code: '',
  });

  const [members, setMembers] = useState([
    { student_name: '', email: '', phone: '', department: '', year_of_study: '', is_leader: true },
    { student_name: '', email: '', phone: '', department: '', year_of_study: '', is_leader: false },
  ]);

  const [pitchData, setPitchData] = useState({
    project_title: '',
    domain: '',
    project_description: '',
  });

  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<any>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedPromotional, setAcceptedPromotional] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Fetch registered colleges from database
  useEffect(() => {
    fetch('/api/colleges')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.colleges)) {
          setRegisteredColleges(data.colleges);
          if (data.colleges.length > 0) {
            setSelectedCollegeOption(data.colleges[0].college_name);
            setCollegeId(data.colleges[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCollegeOption(val);
    const found = registeredColleges.find((c) => c.college_name === val);
    setCollegeId(found ? found.id : null);
  };

  const finalCollegeName = selectedCollegeOption;

  // Fee calculation (₹299 per participant)
  const baseFeePerMember = 299;
  const subtotal = members.length * baseFeePerMember;
  // ₹100 discount per participant when SHEPITCH100 is applied
  const discountPerMember = isCouponApplied ? 100 : 0;
  const discountAmount = members.length * discountPerMember;
  const finalAmount = Math.max(0, subtotal - discountAmount);

  const handleMemberChange = (index: number, field: string, value: any) => {
    const updated = [...members];
    (updated[index] as any)[field] = value;
    setMembers(updated);
  };

  const addMember = () => {
    if (members.length >= 4) {
      alert('Maximum 4 members allowed per team.');
      return;
    }
    setMembers([
      ...members,
      { student_name: '', email: '', phone: '', department: '', year_of_study: '', is_leader: false },
    ]);
  };

  const removeMember = (index: number) => {
    if (members.length <= 2) {
      alert('Minimum 2 members required per team.');
      return;
    }
    const updated = members.filter((_, i) => i !== index);
    // Ensure first member remains leader
    if (updated.length > 0) {
      updated[0].is_leader = true;
    }
    setMembers(updated);
  };

  const applyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = formData.coupon_code.trim().toUpperCase();
    if (!code) return;

    if (code === 'SHEPITCH100') {
      setIsCouponApplied(true);
      setCouponSuccess(`Coupon SHEPITCH100 Applied! ₹100 off per participant (Total ₹${members.length * 100} discount).`);
    } else {
      setIsCouponApplied(false);
      setCouponError('Invalid coupon code.');
    }
  };

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

  // Razorpay Checkout & Registration Submission
  const handleRegisterAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!acceptedTerms || !acceptedPrivacy || !acceptedPromotional) {
      setErrorMsg('Please review and check all required consent boxes (Privacy, Promotional Consent, and Terms & Conditions) to proceed.');
      setLoading(false);
      return;
    }

    if (!finalCollegeName || finalCollegeName.trim() === '') {
      setErrorMsg('Please select or specify your College Name.');
      setLoading(false);
      return;
    }

    try {
      // 1. Dynamically load Razorpay SDK on-demand
      const isRzpLoaded = await loadRazorpayScript();
      if (!isRzpLoaded) {
        setErrorMsg('Razorpay Payment Gateway SDK failed to load. Please check your network connection.');
        setLoading(false);
        return;
      }

      // 2. Create Razorpay Order via API
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: formData.team_name,
          category: formData.category,
          project_title: pitchData.project_title,
          domain: pitchData.domain,
          project_description: pitchData.project_description,
          college_name: finalCollegeName,
          college_id: collegeId,
          leader_name: members[0].student_name,
          leader_email: members[0].email,
          leader_phone: members[0].phone,
          members,
          coupon_code: formData.coupon_code,
          amount_in_rupees: finalAmount,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || 'Failed to initialize payment.');

      // 3. Open Razorpay Modal
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShePitch Chennai',
        description: `SHEPITCH Chennai Edition Registration`,
        image: '/assets/logo/shepitch-logo.png',
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            setLoading(true);
            // Verify Payment Signature & Trigger Confirmation Email
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                team_id: orderData.team_id,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed.');

            setSuccessReceipt({
              teamName: formData.team_name,
              leaderName: members[0].student_name,
              leaderEmail: members[0].email,
              paymentId: response.razorpay_payment_id,
              amount: finalAmount,
              category: formData.category,
              college: finalCollegeName,
            });
          } catch (err: any) {
            setErrorMsg(err.message || 'Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: members[0].student_name,
          email: members[0].email,
          contact: members[0].phone,
        },
        theme: {
          color: '#6C3B8F',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setErrorMsg(`Payment failed: ${resp.error.description || 'Transaction cancelled'}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Success Modal Receipt */}
      {successReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl text-center relative animate-fade-in">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="she-category-tag">Registration Complete</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Welcome to ShePitch Chennai!</h3>
              <p className="text-sm text-gray-600">
                Payment verified. A formal confirmation receipt has been dispatched to <strong>{successReceipt.leaderEmail}</strong> via Nodemailer.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-left text-sm space-y-2.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Team Name:</span>
                <span className="font-bold text-gray-900">{successReceipt.teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category Track:</span>
                <span className="font-bold text-[#6C3B8F]">{successReceipt.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">College:</span>
                <span className="font-bold text-gray-900">{successReceipt.college}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment ID:</span>
                <span className="font-mono text-gray-700">{successReceipt.paymentId}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-base">
                <span>Amount Paid:</span>
                <span className="text-green-600">₹{successReceipt.amount}</span>
              </div>
            </div>

            <button
              onClick={() => (window.location.href = '/')}
              className="she-btn-primary w-full justify-center text-sm py-4 uppercase tracking-wider font-extrabold"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      )}

      {/* Error Popup Modal */}
      {errorMsg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center relative animate-fade-in border border-red-100">
            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shrink-0 shadow-inner">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">Registration Notice</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
                {errorMsg}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-extrabold py-3.5 px-6 rounded-xl uppercase tracking-wider shadow-lg shadow-red-600/20 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

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
                  <span className="font-extrabold text-gray-900 block text-sm">3. Joint Promotional Consent (UGHAM & ICEBRKR)</span>
                </div>
                <p>
                  I consent to receive official event updates, competition announcements, schedule alerts, and promotional communications via email, SMS, or phone from both UGHAM and ICEBRKR using the provided contact details. I also consent to provide my email, SMS, or phone or my other contact information with full consent and knowledge without any doubts.                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">4. 1-Year Free ICEBRKR Testing Platform Access</span>
                <p>
                  As an exclusive participant benefit, all registered team members will receive 1 Year of Free Access to ICEBRKR's product testing platform upon official application launch.
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
                  ShePitch, UGHAM, and ICEBRKR reserve the right to publish non-confidential project titles, team photographs, and event highlights for national media releases and publicity.
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
                <span className="font-extrabold text-gray-900 block text-sm">10. Role of ICEBRKR & Limitation of Liability</span>
                <p>
                  ICEBRKR is participating solely as a sponsor and ecosystem partner and is not the organiser or administrator of the event.  ICEBRKR shall not be responsible or liable for matters relating to registration, payments, participant selection, judging, prizes, venue, scheduling, cancellation, event operations or any other decisions or activities controlled by the event organiser. Any payment done in relation to this event by the participants or anyone through the payment portal on this site, is strictly not received by ICEBRKR. To the maximum extent permitted by applicable law, ICEBRKR shall not be liable for any loss, damage, claim, cost or expense arising from participation in or conduct of the event, except to the extent directly caused by ICEBRKR's own acts or omissions.                </p>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/70 space-y-1">
                <span className="font-extrabold text-gray-900 block text-sm">11. Grand Finale Attendance & Final Evaluation</span>
                <p>
                  Shortlisted finalists agree to present their pitch live at Jeppiaar University, Chennai on 08 September 2026. All evaluations and award decisions made by the official judging panel are final.
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

      {/* Main Registration Form Container */}
      <form onSubmit={handleRegisterAndPay} className="bg-white rounded-3xl p-6 sm:p-12 border border-gray-100 shadow-xl space-y-10">

        {/* Section 1: Team & College Info */}
        <div className="space-y-5">
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5 border-b border-gray-100 pb-4">
            <Building2 className="w-6 h-6 text-[#6C3B8F]" /> 1. Team & Institution Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-2">Team Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. InnovateX Girls"
                value={formData.team_name}
                onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
              />
            </div>

            <div>
              <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-2">Select College / Institution *</label>
              <select
                value={selectedCollegeOption}
                onChange={handleCollegeChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
              >
                {registeredColleges.length === 0 ? (
                  <option value="">Loading Partner Colleges...</option>
                ) : (
                  registeredColleges.map((c) => (
                    <option key={c.id} value={c.college_name}>
                      {c.college_name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Student Members (2 - 4) */}
        <div className="space-y-5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 flex-wrap gap-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-[#6C3B8F] shrink-0" />
              <span>
                <span className="block sm:inline">2. Team Members</span>{' '}
                <span className="block sm:inline text-sm sm:text-2xl font-bold sm:font-extrabold text-gray-500 sm:text-gray-900">
                  ({members.length} Participants)
                </span>
              </span>
            </h3>
            <button
              type="button"
              onClick={addMember}
              className="she-btn-outline text-xs sm:text-sm py-2 px-4 flex items-center gap-1.5 font-bold"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
          </div>

          <div className="space-y-5">
            {members.map((m, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-4 relative">
                <div className="flex justify-between items-center">
                  <span className="font-black text-sm text-[#6C3B8F] uppercase tracking-wider">
                    {idx === 0 ? 'Member 1 (Team Leader)' : `Member ${idx + 1}`}
                  </span>
                  {idx > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {/* Row 1: Student Full Name & Email Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-2">Student Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Name"
                        value={m.student_name}
                        onChange={(e) => handleMemberChange(idx, 'student_name', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 focus:outline-none focus:border-[#6C3B8F] shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="student@gmail.com"
                        value={m.email}
                        onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 focus:outline-none focus:border-[#6C3B8F] shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Row 2: Mobile Number, Department & Year of Study */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-2">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={m.phone}
                        onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 focus:outline-none focus:border-[#6C3B8F] shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-2">Department</label>
                      <input
                        type="text"
                        placeholder="e.g. B.Tech IT"
                        value={m.department}
                        onChange={(e) => handleMemberChange(idx, 'department', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 focus:outline-none focus:border-[#6C3B8F] shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-2">Year of Study</label>
                      <select
                        value={m.year_of_study}
                        onChange={(e) => handleMemberChange(idx, 'year_of_study', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 focus:outline-none focus:border-[#6C3B8F] shadow-sm"
                      >
                        <option value="">Select Year of Study</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Post Graduate">Post Graduate</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Pitch Proposal */}
        <div className="space-y-5 pt-4 border-t border-gray-100">
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#6C3B8F]" /> 3. Pitch Proposal
          </h3>

          <div className="space-y-5">
            {/* Participation Category Cards */}
            <div>
              <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-2.5">
                PARTICIPATION CATEGORY *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div
                  onClick={() => setFormData({ ...formData, category: 'Idea Pitch' })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.category === 'Idea Pitch'
                      ? 'border-[#6C3B8F] bg-purple-50/70 shadow-md'
                      : 'border-gray-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <span className="block font-black text-base sm:text-lg text-gray-900 text-center">Idea Pitch</span>
                  <span className="block text-sm text-gray-500 text-center mt-1 font-medium">Early concept stage</span>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, category: 'Project Pitch' })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.category === 'Project Pitch'
                      ? 'border-[#6C3B8F] bg-purple-50/70 shadow-md'
                      : 'border-gray-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <span className="block font-black text-base sm:text-lg text-gray-900 text-center">Project Pitch</span>
                  <span className="block text-sm text-gray-500 text-center mt-1 font-medium">Prototype/Working Model</span>
                </div>
              </div>
            </div>

            {/* Title & Domain */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-2">
                  TITLE OF IDEA / PROJECT *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Project Title"
                  value={pitchData.project_title}
                  onChange={(e) => setPitchData({ ...pitchData, project_title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-2">
                  DOMAIN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., HealthTech, FinTech"
                  value={pitchData.domain}
                  onChange={(e) => setPitchData({ ...pitchData, domain: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                />
              </div>
            </div>

            {/* Brief Description */}
            <div>
              <label className="block text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-2">
                BRIEF DESCRIPTION *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Explain your project in 2–3 sentences..."
                value={pitchData.project_description}
                onChange={(e) => setPitchData({ ...pitchData, project_description: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Payment Summary & Checkout */}
        <div className="space-y-5 pt-4 border-t border-gray-100">
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-[#6C3B8F]" /> 4. Payment Summary & Checkout
          </h3>

          <div className="bg-purple-50/50 p-6 sm:p-8 rounded-2xl border border-purple-100 space-y-5">
            {/* Coupon Box */}
            <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl p-1.5 focus-within:border-[#6C3B8F] shadow-xs">
              <input
                type="text"
                placeholder="Enter Coupon Code"
                value={formData.coupon_code}
                onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-gray-900 uppercase tracking-wider focus:outline-none min-w-0"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="bg-[#6C3B8F] text-white text-xs sm:text-sm font-extrabold px-4 sm:px-6 py-2.5 rounded-lg hover:bg-[#5a2e7a] uppercase tracking-wider transition-all shrink-0"
              >
                Apply
              </button>
            </div>

            {couponError && <p className="text-sm text-red-600 font-semibold">{couponError}</p>}
            {couponSuccess && <p className="text-sm text-green-600 font-extrabold">{couponSuccess}</p>}

            {/* Price Calculations */}
            <div className="space-y-2 text-sm sm:text-base text-gray-700 border-t border-purple-100 pt-4">
              <div className="flex justify-between">
                <span>Fee per Participant:</span>
                <span className="font-bold">₹{baseFeePerMember}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Members:</span>
                <span className="font-bold">{members.length} Students</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount Applied:</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-lg sm:text-xl font-black text-gray-900 border-t border-purple-200 pt-3">
                <span>Total Amount Payable:</span>
                <span className="text-[#6C3B8F]">₹{finalAmount}</span>
              </div>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-3 pt-2">
            {/* Checkbox 1: Data Privacy & Encryption Security (Point 2) */}
            <div className="flex items-start gap-3 p-3.5 bg-purple-50/40 rounded-2xl border border-purple-100/80">
              <input
                type="checkbox"
                id="privacy_checkbox"
                required
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 w-5 h-5 text-[#6C3B8F] border-gray-300 rounded focus:ring-[#6C3B8F] cursor-pointer accent-[#6C3B8F] shrink-0"
              />
              <label htmlFor="privacy_checkbox" className="text-xs sm:text-sm text-gray-700 leading-relaxed cursor-pointer font-medium select-none">
                <strong>Data Authenticity & Voluntary Submission:</strong> I hereby declare that all submitted information (team name, student leader & member details, college name, email addresses, phone numbers, and pitch proposals) is authentic, accurate, and submitted voluntarily by our team. Submission of false, misleading or fraudulent information may result in disqualification. *
              </label>
            </div>

            {/* Checkbox 2: Joint Promotional Consent (Point 3) */}
            <div className="flex items-start gap-3 p-3.5 bg-purple-50/40 rounded-2xl border border-purple-100/80">
              <input
                type="checkbox"
                id="promotional_checkbox"
                required
                checked={acceptedPromotional}
                onChange={(e) => setAcceptedPromotional(e.target.checked)}
                className="mt-1 w-5 h-5 text-[#6C3B8F] border-gray-300 rounded focus:ring-[#6C3B8F] cursor-pointer accent-[#6C3B8F] shrink-0"
              />
              <label htmlFor="promotional_checkbox" className="text-xs sm:text-sm text-gray-700 leading-relaxed cursor-pointer font-medium select-none">
                <strong>Joint Promotional Consent (UGHAM & ICEBRKR):</strong> I consent to receive official event updates, competition announcements, schedule alerts, and promotional communications via email, SMS, or phone from both <strong>UGHAM</strong> and <strong>ICEBRKR</strong> using the provided contact details. *
              </label>
            </div>

            {/* Checkbox 3: General Terms & Conditions */}
            <div className="flex items-start gap-3 p-3.5 bg-purple-50/40 rounded-2xl border border-purple-100/80">
              <input
                type="checkbox"
                id="terms_checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-[#6C3B8F] border-gray-300 rounded focus:ring-[#6C3B8F] cursor-pointer accent-[#6C3B8F] shrink-0"
              />
              <label htmlFor="terms_checkbox" className="text-xs sm:text-sm text-gray-700 leading-relaxed cursor-pointer font-medium select-none">
                I certify that all details submitted are accurate and I accept all of the{' '}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full she-btn-primary justify-center py-4 sm:py-5 text-base sm:text-lg font-black uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-[#6C3B8F]/20 disabled:opacity-50"
          >
            {loading ? 'Opening Razorpay Secure Gateway...' : `Pay ₹${finalAmount} & Complete Registration`}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="she-category-tag">Register Now</span>
        </div>
        <AnimatedTitle
          text="Join ShePitch Chennai National Finale"
          gradientWords={['ShePitch', 'Finale']}
          mobileBreakWords={['ShePitch', 'Chennai', 'Finale']}
          className="text-3xl sm:text-5xl font-extrabold text-gray-900"
        />
        <p className="text-gray-600 text-sm sm:text-base">
          Fill out your team details below to secure your spot at Jeppiaar University on 19 September 2026.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-12 text-gray-400">Loading registration form...</div>}>
        <RegisterFormContent />
      </Suspense>
    </div>
  );
}
