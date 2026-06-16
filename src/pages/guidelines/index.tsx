import { FiCheckSquare, FiAlertCircle, FiLock, FiInfo } from "react-icons/fi";

export default function Guidelines() {
  const instructions = [
    {
      title: "Eligibility to Vote",
      desc: "All registered and verified users are eligible to participate in active voting processes.",
      icon: FiInfo,
    },
    {
      title: "One Vote Per Category",
      desc: "You can cast exactly one vote per active election program. You can toggle/change your vote before the timer expires.",
      icon: FiCheckSquare,
    },
    {
      title: "Confidentiality & Privacy",
      desc: "All ballots are encrypted and stored anonymously. Neither administrators nor other users can view your individual vote selection.",
      icon: FiLock,
    },
    {
      title: "Review System Regulations",
      desc: "Attempting to manipulate votes, use multiple accounts, or bypass OTP verification will result in immediate suspension.",
      icon: FiAlertCircle,
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d1e43] mb-1">Voters Guidelines</h1>
        <p className="text-slate-500 text-sm">
          Please read and understand the system guidelines before casting your vote.
        </p>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl p-8 space-y-6">
        <h3 className="text-lg font-bold text-[#0d1e43]">Standard Voting Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {instructions.map((item, index) => (
            <div
              key={index}
              className="border border-slate-100 rounded-2xl p-6 space-y-3 bg-slate-50/50"
            >
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#0d1e43]">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
