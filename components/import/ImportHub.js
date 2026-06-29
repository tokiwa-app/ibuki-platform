import { useState } from 'react';
import SankiImport from './TOKIWA/SANKI';

export default function ImportHub() {
  const [step, setStep] = useState('select'); // select | sanki

  if (step === 'sanki') {
    return <SankiImport onBack={() => setStep('select')} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        データ取り込み
      </h2>

      {/* 取引先 */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">
          取引先
        </h3>

        <button
          className="
            inline-flex items-center
            px-4 py-2
            rounded-md
            border border-gray-300
            bg-white
            text-sm font-medium
            hover:bg-gray-100
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        >
          TOKIWA
        </button>
      </div>

      {/* フォーマット */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">
          フォーマット
        </h3>

        <button
          onClick={() => setStep('sanki')}
          className="
            inline-flex items-center
            px-4 py-2
            rounded-md
            border border-blue-600
            bg-blue-600
            text-sm font-semibold text-white
            hover:bg-blue-700
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        >
          三基 出荷指示データを取り込む
        </button>
      </div>
    </div>
  );
}
