'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';
import AnimatedTitle from '@/components/AnimatedTitle';

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') === 'Project Pitch' ? 'Project Pitch' : 'Idea Pitch';

  // Form State
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [city, setCity] = useState('');
  const [memberCount, setMemberCount] = useState<number>(2);

  // Additional Members
  const [members, setMembers] = useState<Array<{ name: string; email: string; phone: string }>>([
    { name: '', email: '', phone: '' },
    { name: '', email: '', phone: '' },
    { name: '', email: '', phone: '' },
  ]);

  // Proposal State
  const [category, setCategory] = useState<string>(initialCategory);
  const [projectTitle, setProjectTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Coupon & Fee State
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');

  // UI State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    teamName: string;
    paidAmount: number;
    refId: string;
  }>({
    show: false,
    teamName: '',
    paidAmount: 0,
    refId: '',
  });

  const basePricePerMember = 299;
  const discountPerMember = isCouponApplied ? 100 : 0;
  const totalFee = memberCount * (basePricePerMember - discountPerMember);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a coupon code.');
      setIsCouponApplied(false);
      return;
    }
    setIsCouponApplied(true);
    setCouponMessage('🎉 Coupon Applied! ₹100 discount per participant applied.');
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName || !leaderName || !leaderEmail || !leaderPhone || !collegeName || !department || !yearOfStudy || !city || !projectTitle || !domain || !projectDescription) {
      setToastMessage('Please fill in all required fields.');
      return;
    }

    if (leaderPhone.length !== 10) {
      setToastMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    for (let i = 0; i < memberCount - 1; i++) {
      if (!members[i].name || !members[i].email) {
        setToastMessage(`Please complete details for Team Member ${i + 2}.`);
        return;
      }
    }

    setIsSubmitting(true);
    setToastMessage(null);

    setTimeout(() => {
      setIsSubmitting(false);
      const generatedId = 'SHE' + Math.floor(100000 + Math.random() * 900000);
      setSuccessModal({
        show: true,
        teamName: teamName,
        paidAmount: totalFee,
        refId: generatedId,
      });
    }, 1200);
  };

  return (
    <>
      {/* Toast Error Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-500 animate-bounce">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Registration Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: TEAM LEAD */}
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6C3B8F]/10 text-[#6C3B8F] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900">Team Lead Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Innovators HQ"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Team Leader Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Phone Number / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={leaderPhone}
                  onChange={(e) => setLeaderPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  College / Institution <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Your College Name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Department / Course <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech AI & DS"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Year of Study <span className="text-red-500">*</span>
                </label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm bg-white"
                  required
                >
                  <option value="" disabled>Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Post Graduate">Post Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chennai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Total Team Members <span className="text-red-500">*</span>
                </label>
                <select
                  value={memberCount}
                  onChange={(e) => setMemberCount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm bg-white font-semibold"
                >
                  <option value={2}>2 Members (Leader + 1 Member)</option>
                  <option value={3}>3 Members (Leader + 2 Members)</option>
                  <option value={4}>4 Members (Leader + 3 Members)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: ADDITIONAL MEMBERS */}
          {memberCount > 1 && (
            <div className="space-y-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#6C3B8F]/10 text-[#6C3B8F] flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900">Additional Team Members</h3>
              </div>

              <div className="space-y-6 pt-2">
                {Array.from({ length: memberCount - 1 }).map((_, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/60 space-y-3">
                    <h4 className="font-bold text-sm text-[#6C3B8F]">Member {idx + 2} Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                        <input
                          type="text"
                          placeholder="Member Name"
                          value={members[idx].name}
                          onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                        <input
                          type="email"
                          placeholder="member@example.com"
                          value={members[idx].email}
                          onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                        <input
                          type="tel"
                          placeholder="Mobile Number"
                          maxLength={10}
                          value={members[idx].phone}
                          onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: PROPOSAL DETAILS */}
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6C3B8F]/10 text-[#6C3B8F] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900">Pitch Proposal Details</h3>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Participation Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    onClick={() => setCategory('Idea Pitch')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      category === 'Idea Pitch'
                        ? 'border-[#6C3B8F] bg-[#6C3B8F]/5 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 text-base">Idea Pitch</span>
                      <input
                        type="radio"
                        name="category"
                        checked={category === 'Idea Pitch'}
                        onChange={() => setCategory('Idea Pitch')}
                        className="accent-[#6C3B8F]"
                      />
                    </div>
                    <span className="text-xs text-gray-500">Early concept, pitch deck presentation only</span>
                  </label>

                  <label
                    onClick={() => setCategory('Project Pitch')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      category === 'Project Pitch'
                        ? 'border-[#E83E8C] bg-[#E83E8C]/5 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 text-base">Project Pitch</span>
                      <input
                        type="radio"
                        name="category"
                        checked={category === 'Project Pitch'}
                        onChange={() => setCategory('Project Pitch')}
                        className="accent-[#E83E8C]"
                      />
                    </div>
                    <span className="text-xs text-gray-500">Working prototype & live demo mandatory</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Title of Idea / Project <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Domain <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HealthTech, AI, FinTech"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Brief Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain your project core innovation in 2-3 sentences..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm"
                  required
                />
              </div>

              {/* Coupon Code */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  College Collaboration Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER COUPON"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-grow px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-sm uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="she-btn-outline text-xs px-5 py-2.5"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-xs mt-1.5 font-semibold ${isCouponApplied ? 'text-green-600' : 'text-red-500'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: FEE CALCULATION & SUBMIT */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/80 rounded-2xl p-6 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="font-bold text-gray-900 text-base">Registration Calculation</h4>
                <p className="text-xs text-gray-500">₹299 base fee per team participant</p>
                <p className="text-xs text-gray-600 font-semibold mt-0.5">
                  {memberCount} Members &times; ₹{basePricePerMember - discountPerMember}
                </p>
              </div>

              <div className="text-right">
                <span className="block text-xs font-bold text-gray-500 uppercase">Total Amount Due</span>
                <span className="text-3xl font-extrabold she-gradient-text">₹{totalFee}</span>
              </div>
            </div>

            {isCouponApplied && (
              <div className="bg-green-100 border border-green-200 text-green-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold">
                <Sparkles className="w-4 h-4 text-green-600 shrink-0" />
                <span>Coupon Applied! ₹100 discount per member has been deducted from your total.</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="she-btn-primary w-full justify-center text-center py-4 text-base font-bold rounded-2xl shadow-xl"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                Processing Registration...
              </span>
            ) : (
              <span>Proceed to Complete Registration</span>
            )}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {successModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900">Registration Successful!</h3>
              <p className="text-xs text-gray-500 mt-1">Your team has been registered for ShePitch 2026.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Team Name:</span>
                <span className="font-bold text-gray-900">{successModal.teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Paid:</span>
                <span className="font-bold text-green-600">₹{successModal.paidAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reference ID:</span>
                <span className="font-mono font-bold text-[#6C3B8F]">{successModal.refId}</span>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="she-btn-primary w-full justify-center text-center py-3"
            >
              Return & Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function RegisterPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="she-category-tag">Register Now</span>
        <AnimatedTitle
          text="Join Now ShePitch Competition"
          gradientWords={['ShePitch']}
          className="text-4xl sm:text-5xl font-extrabold text-gray-900"
        />
        <p className="text-gray-600 text-base">
          Your Idea. Your Voice. Your Future. Register now to secure your spot at Jeppiaar University.
        </p>
      </div>

      <Suspense fallback={
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 shadow-xl border border-gray-100">
          Loading registration form...
        </div>
      }>
        <RegisterFormContent />
      </Suspense>
    </div>
  );
}
