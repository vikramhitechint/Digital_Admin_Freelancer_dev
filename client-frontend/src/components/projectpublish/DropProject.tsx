import React from "react";
import { UIProject } from "../../types";

export default function DropProject({ 
  project, 
  onClose, 
  onConfirmDrop 
}: { 
  project: any; 
  onClose: () => void; 
  onConfirmDrop: (id: string, fee: string) => void; 
}) {
  if (!project) return null;

  // Calculate 10% Platform Fee
  const parseAmountNumber = (amountStr: string | number) => {
    const num = Number(String(amountStr).replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const rawAmount = parseAmountNumber(project.amount);
  const platformFee = Math.round(rawAmount * 0.1);
  const formattedFee = "₹" + platformFee.toLocaleString("en-IN");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="p-6 text-center space-y-4">
          {/* Warning Icon */}
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif">Drop Project Confirmation</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              If you want to drop this project, you need to pay your project{" "}
              <strong className="text-slate-900">10% Cancellation fee</strong> before Drop.
            </p>
          </div>

          {/* Fee Calculation Summary */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Project Title:</span>
              <span className="font-semibold text-slate-900 truncate max-w-[180px]">{project.name}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Total Project Budget:</span>
              <span className="font-serif font-semibold text-slate-900">{project.amount}</span>
            </div>
            <div className="pt-2 border-t border-blue-200/60 flex justify-between text-xs font-bold text-blue-900">
              <span>10% Platform Fee Payable:</span>
              <span className="font-serif text-sm text-blue-600">{formattedFee}</span>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirmDrop(project.id, formattedFee)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 hover:shadow-md transition cursor-pointer"
            >
              Pay with Razorpay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}