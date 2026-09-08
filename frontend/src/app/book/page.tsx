'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';

interface Expert {
  id: string;
  name: string;
  specialty: string;
}

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
}

export default function BookSession() {
  const router = useRouter();
  const { token, user, refreshUserData } = useAuth();

  // Booking details state
  const [serviceType, setServiceType] = useState<'quick_check' | 'standard' | 'gold_bundle' | 'platinum_sub'>('standard');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  
  // Billing details
  const [phone, setPhone] = useState('');
  const [momoProvider, setMomoProvider] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');
  const [priorityAddon, setPriorityAddon] = useState(false);

  // Flow control
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  
  // Checkout Modal Sim
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    if (token && user) {
      setPhone(user.phone);
    }
  }, [token, user]);

  useEffect(() => {
    if (serviceType === 'standard' || serviceType === 'quick_check') {
      fetchExperts();
    }
  }, [serviceType]);

  useEffect(() => {
    if (selectedExpertId) {
      fetchSlots(selectedExpertId);
    }
  }, [selectedExpertId]);

  const fetchExperts = async () => {
    setLoadingExperts(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/experts`);
      if (res.ok) {
        const data = await res.json();
        setExperts(data);
        if (data.length > 0) setSelectedExpertId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExperts(false);
    }
  };

  const fetchSlots = async (expertId: string) => {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlotId('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/experts/${expertId}/slots`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
        if (data.length > 0) setSelectedSlotId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSlots(false);
    }
  };

  const getPrice = () => {
    let base = 0;
    if (serviceType === 'quick_check') base = 1000;
    else if (serviceType === 'standard') base = 1500;
    else if (serviceType === 'gold_bundle') base = 3500;
    else if (serviceType === 'platinum_sub') base = 5000;

    if (serviceType === 'standard' && priorityAddon) {
      base += 500;
    }
    return base;
  };

  // Perform Book using wallet credits instantly
  const handleWalletBook = async (creditType: 'gold_credit' | 'platinum_credit') => {
    if (!token) {
      alert('Please sign in to book sessions.');
      return;
    }
    if (!selectedSlotId) {
      alert('Please select an available timeslot.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/wallet-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          slotId: selectedSlotId,
          serviceType: creditType,
        }),
      });

      if (res.ok) {
        alert('Booking confirmed using wallet credits!');
        await refreshUserData();
        router.push('/dashboard/user');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to book using wallet credits.');
      }
    } catch (e) {
      console.error(e);
      alert('Connection error');
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in or enter your mobile number in the header first.');
      return;
    }

    const price = getPrice();
    setSubmittingPayment(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          phone: phone,
          provider: momoProvider,
          amount: price,
          serviceType: serviceType,
          slotId: (serviceType === 'quick_check' || serviceType === 'standard') ? selectedSlotId : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPaymentReference(data.payment.reference);
        setPaymentAmount(price);
        setShowCheckoutModal(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Checkout initiation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Could not connect to payment gateway.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Simulates MoMo response via webhook
  const simulatePaymentResponse = async (status: 'success' | 'failed') => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: paymentReference,
          status: status,
        }),
      });

      if (res.ok) {
        setShowCheckoutModal(false);
        if (status === 'success') {
          alert('Mobile Money Payment Confirmed successfully!');
          await refreshUserData();
          if (serviceType === 'quick_check' || serviceType === 'standard') {
            router.push('/dashboard/user');
          } else {
            router.push('/');
          }
        } else {
          alert('Simulated payment cancel / fail saved.');
        }
      }
    } catch (e) {
      console.error(e);
      alert('Webhook simulation failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex-grow space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white">Book Private Consultation</h2>
        <p className="text-slate-400 text-sm mt-1">
          No records shared. Select a service model that fits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Step 1: Select Service Tiers */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4 border-slate-800/80">
            <h3 className="text-base font-bold uppercase tracking-wider text-teal-400">
              1. Choose Service Pass / Package
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setServiceType('standard')}
                className={`p-4 rounded-xl text-left border transition-all ${
                  serviceType === 'standard'
                    ? 'border-teal-400 bg-teal-950/20 shadow-md shadow-teal-950/40'
                    : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">Standard Pass</h4>
                  <span className="text-teal-400 font-extrabold text-xs">1,500 RWF</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  30-Min scheduled session with a selected expert.
                </p>
              </button>

              <button
                onClick={() => setServiceType('quick_check')}
                className={`p-4 rounded-xl text-left border transition-all ${
                  serviceType === 'quick_check'
                    ? 'border-teal-400 bg-teal-950/20 shadow-md shadow-teal-950/40'
                    : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">Quick Check</h4>
                  <span className="text-teal-400 font-extrabold text-xs">1,000 RWF</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  15-Min queue-based routing to the next active expert.
                </p>
              </button>

              <button
                onClick={() => setServiceType('gold_bundle')}
                className={`p-4 rounded-xl text-left border transition-all ${
                  serviceType === 'gold_bundle'
                    ? 'border-blue-500 bg-blue-950/30 shadow-md shadow-blue-950/40'
                    : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">Gold Bundle</h4>
                  <span className="text-blue-300 font-extrabold text-xs">3,500 RWF</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Prepay 3 Standard Passes (Save 20%) credited to wallet.
                </p>
              </button>

              <button
                onClick={() => setServiceType('platinum_sub')}
                className={`p-4 rounded-xl text-left border transition-all ${
                  serviceType === 'platinum_sub'
                    ? 'border-blue-500 bg-blue-950/30 shadow-md shadow-blue-950/40'
                    : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">Platinum Monthly</h4>
                  <span className="text-blue-300 font-extrabold text-xs">5,000 RWF/mo</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  120 minutes/month credit + unlimited anonymous expert chat.
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Pick Expert & Timeslots (Only for passes) */}
          {(serviceType === 'standard' || serviceType === 'quick_check') && (
            <div className="glass-panel rounded-2xl p-6 space-y-6 border-slate-800/80">
              <h3 className="text-base font-bold uppercase tracking-wider text-teal-400">
                2. Select Expert & Schedule
              </h3>

              {loadingExperts ? (
                <div className="text-xs text-slate-400">Loading verified experts list...</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                      Choose verified medical practitioner
                    </label>
                    <select
                      value={selectedExpertId}
                      onChange={(e) => setSelectedExpertId(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500"
                    >
                      {experts.map((exp) => (
                        <option key={exp.id} value={exp.id}>
                          {exp.name} — {exp.specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  {loadingSlots ? (
                    <div className="text-xs text-slate-400">Searching slots availability...</div>
                  ) : slots.length > 0 ? (
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                        Select timeslot
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {slots.map((slot) => {
                          const dateObj = new Date(slot.startTime);
                          const formattedTime = dateObj.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          const formattedDate = dateObj.toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          });

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`p-3 rounded-lg text-center text-xs border transition-all ${
                                selectedSlotId === slot.id
                                  ? 'border-teal-400 bg-teal-950/30 text-white font-bold'
                                  : 'border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span className="block font-bold">{formattedTime}</span>
                              <span className="block text-[10px] text-slate-400 mt-0.5">
                                {formattedDate}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-400 bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl">
                      ⚠️ No availability slots listed in the future for this expert. Try another expert or check back later.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add-ons for Standard Pass */}
          {serviceType === 'standard' && (
            <div className="glass-panel rounded-2xl p-6 space-y-3 border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Priority Q&A Reply Add-on</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Guarantees one anonymous forum question gets expert answer within 24 hours.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-teal-400 font-extrabold">+500 RWF</span>
                  <input
                    type="checkbox"
                    checked={priorityAddon}
                    onChange={(e) => setPriorityAddon(e.target.checked)}
                    className="w-4 h-4 rounded accent-teal-500 bg-slate-900 border-slate-700"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Checkout details summary */}
        <div className="space-y-6">
          {/* Credit quick-book */}
          {token && !loadingSlots && selectedSlotId && (
            <div className="glass-panel rounded-2xl p-6 space-y-4 border-amber-500/30 bg-amber-950/10">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Pay with Wallet
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                If you have passes or minutes from a previous Gold bundle/Platinum sub, you can book instantly without billing:
              </p>
              
              <div className="grid grid-cols-1 gap-2 pt-2">
                <button
                  onClick={() => handleWalletBook('gold_credit')}
                  disabled={(user?.wallet?.sessionCredits || 0) < 1}
                  className="w-full py-2.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-30 disabled:hover:bg-amber-500"
                >
                  Use 1 Gold Pass credit
                </button>
                <button
                  onClick={() => handleWalletBook('platinum_credit')}
                  disabled={(user?.wallet?.minuteBalance || 0) < 30}
                  className="w-full py-2.5 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors disabled:opacity-30 disabled:hover:bg-teal-500"
                >
                  Use 30 Platinum minutes
                </button>
              </div>
            </div>
          )}

          {/* Standard Payment Checkout */}
          <div className="glass-panel rounded-2xl p-6 space-y-6 border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Billing Details
            </h3>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  Mobile Money Provider (RWF)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMomoProvider('mtn_momo')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      momoProvider === 'mtn_momo'
                        ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                        : 'border-slate-800/80 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    MTN MoMo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMomoProvider('airtel_money')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      momoProvider === 'airtel_money'
                        ? 'border-red-500 bg-red-500/10 text-red-400'
                        : 'border-slate-800/80 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    Airtel Money
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  Payment Phone number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +250 788 123 456"
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="border-t border-slate-800/80 pt-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span>{getPrice()} RWF</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1">
                  <span>Total Amount</span>
                  <span className="text-teal-400">{getPrice()} RWF</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingPayment || (!selectedSlotId && (serviceType === 'standard' || serviceType === 'quick_check'))}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:opacity-95 text-xs transition-opacity disabled:opacity-40 shadow-lg shadow-teal-900/30"
              >
                {submittingPayment ? 'Connecting gateway...' : 'Confirm and Pay (MoMo)'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Checkout Simulator Modal overlay */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070c]/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm glass-panel border border-slate-700/80 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-teal-950/40">
            <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/30 rounded-full flex items-center justify-center mx-auto text-xl animate-bounce">
              📲
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Simulated USSD STK Push</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                We have pushed a payment notification prompt to <span className="text-white font-semibold">{phone}</span>.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 text-xs space-y-1.5 text-left">
              <div><span className="text-slate-400">Merchant:</span> <span className="text-white font-bold">Talk No Filter</span></div>
              <div><span className="text-slate-400">Amount:</span> <span className="text-teal-400 font-bold">{paymentAmount} RWF</span></div>
              <div><span className="text-slate-400">Reference:</span> <span className="text-slate-200 select-all font-mono text-[10px]">{paymentReference}</span></div>
              <div><span className="text-slate-400">Status:</span> <span className="text-amber-400 font-semibold animate-pulse">Waiting for PIN entry...</span></div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => simulatePaymentResponse('success')}
                className="py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-500 shadow-md shadow-teal-900/20"
              >
                Simulate PIN success
              </button>
              <button
                onClick={() => simulatePaymentResponse('failed')}
                className="py-2.5 rounded-xl text-xs font-bold bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-slate-300"
              >
                Cancel / Timeout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
