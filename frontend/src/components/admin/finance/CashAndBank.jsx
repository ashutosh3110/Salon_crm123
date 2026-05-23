import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  CreditCard,
  RefreshCcw,
  Lock,
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import api from '../../../services/api';

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

export default function CashAndBank() {
  const [businessDate, setBusinessDate] = useState(todayIso());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);

  const [actualCash, setActualCash] = useState('');
  const [actualBank, setActualBank] = useState('');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/finance/cash-bank', {
        params: { date: businessDate }
      });

      const d = res.data?.data;
      setPayload(d);

      if (d?.saved) {
        setActualCash(
          d.saved.actualCash != null ? String(d.saved.actualCash) : ''
        );
        setActualBank(
          d.saved.actualBank != null ? String(d.saved.actualBank) : ''
        );
        setNotes(d.saved.notes || '');
      } else {
        setActualCash('');
        setActualBank('');
        setNotes('');
      }
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e.message ||
          'Failed to load'
      );
    } finally {
      setLoading(false);
    }
  }, [businessDate]);

  useEffect(() => {
    load();
  }, [load]);

  const system = payload || {
    cash: { opening: 0, sales: 0, expenses: 0, net: 0 },
    bank: { opening: 0, sales: 0, expenses: 0, net: 0 }
  };

  const cashDiff =
    actualCash !== ''
      ? parseFloat(actualCash) - system.cash.net
      : null;

  const bankDiff =
    actualBank !== ''
      ? parseFloat(actualBank) - system.bank.net
      : null;

  const handleSave = async () => {
    if (actualCash === '' || actualBank === '') {
      setError('Enter cash and bank amount');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.post('/finance/cash-bank/reconcile', {
        businessDate,
        actualCash: parseFloat(actualCash),
        actualBank: parseFloat(actualBank),
        notes,
        locked: true
      });

      await load();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e.message ||
          'Save failed'
      );
    } finally {
      setSaving(false);
    }
  };

  const locked = payload?.saved?.status === 'closed';

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text">
            Cash & Bank
          </h2>
          <p className="text-sm text-text-secondary">
            Daily balance check and closing
          </p>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
            <Calendar className="w-4 h-4" />
            <input
              type="date"
              value={businessDate}
              onChange={(e) =>
                setBusinessDate(e.target.value)
              }
              className="outline-none text-sm"
            />
          </div>

          <button
            onClick={load}
            className="border rounded-lg px-3 py-2 flex items-center gap-2 bg-white"
          >
            <RefreshCcw
              className={`w-4 h-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-sm">
          Loading...
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-5">

            {/* CASH */}
            <Card
              icon={<Wallet className="w-5 h-5" />}
              title="Cash"
            >
              <SummaryRow
                label="Opening"
                value={system.cash.opening}
              />
              <SummaryRow
                label="Sales"
                value={system.cash.sales}
              />
              <SummaryRow
                label="Expense"
                value={system.cash.expenses}
              />

              <div className="flex justify-between border-t pt-3 font-semibold">
                <span>System Total</span>
                <span>
                  ₹
                  {system.cash.net.toLocaleString('en-IN')}
                </span>
              </div>

              <InputBox
                label="Actual Cash"
                value={actualCash}
                onChange={setActualCash}
                disabled={locked}
              />

              <DiffBox diff={cashDiff} />
            </Card>

            {/* BANK */}
            <Card
              icon={<CreditCard className="w-5 h-5" />}
              title="Bank"
            >
              <SummaryRow
                label="Opening"
                value={system.bank.opening}
              />
              <SummaryRow
                label="Sales"
                value={system.bank.sales}
              />
              <SummaryRow
                label="Expense"
                value={system.bank.expenses}
              />

              <div className="flex justify-between border-t pt-3 font-semibold">
                <span>System Total</span>
                <span>
                  ₹
                  {system.bank.net.toLocaleString('en-IN')}
                </span>
              </div>

              <InputBox
                label="Actual Bank"
                value={actualBank}
                onChange={setActualBank}
                disabled={locked}
              />

              <DiffBox diff={bankDiff} />
            </Card>
          </div>

          {/* Notes */}
          <div className="border rounded-xl bg-white p-5 space-y-4">
            <h3 className="font-medium text-sm">Notes</h3>

            <textarea
              rows={3}
              value={notes}
              disabled={locked}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              placeholder="Remarks..."
              className="w-full border rounded-lg p-3 outline-none"
            />

            {locked ? (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Day locked
              </div>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-white px-5 py-3 rounded-lg flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {saving
                  ? 'Saving...'
                  : 'Save & Lock'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Card({ icon, title, children }) {
  return (
    <div className="bg-white border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>
        ₹{Number(value || 0).toLocaleString('en-IN')}
      </span>
    </div>
  );
}

function InputBox({
  label,
  value,
  onChange,
  disabled
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm">{label}</label>
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full border rounded-lg px-3 py-2 outline-none"
        placeholder="Enter amount"
      />
    </div>
  );
}

function DiffBox({ diff }) {
  if (diff == null) return null;

  const matched = Math.abs(diff) < 0.01;

  return (
    <div
      className={`rounded-lg p-3 flex justify-between items-center text-sm ${
        matched
          ? 'bg-green-50 text-green-700'
          : 'bg-red-50 text-red-600'
      }`}
    >
      <div className="flex items-center gap-2">
        {matched ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}
        {matched ? 'Matched' : 'Difference'}
      </div>

      <div>
        ₹{Math.abs(diff).toLocaleString('en-IN')}
      </div>
    </div>
  );
}