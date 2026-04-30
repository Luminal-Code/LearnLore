interface MainCardProps {
    subject: string;
    type: string;
    question: string;
    answer: string;
    explanation: string;
    hook: string;
    source: string;
    showAnswer: boolean;
    showDetails: boolean;
    onToggleDetails?: () => void;
}

export function MainCard(props: MainCardProps) {
    return (
        <div className="w-full max-w-[600px] min-h-[340px] bg-[#f7f8f5] rounded-3xl shadow-md px-10 py-10 flex flex-col">
            {!props.showAnswer ? (
                <>
                    <div className="flex gap-3 mb-7">
                        <span className="bg-[#e5e8e1] text-sm px-4 py-1 rounded-full">
                            {props.subject}
                        </span>
                        <span className="bg-[#e5e8e1] text-sm px-4 py-1 rounded-full">
                            {props.type}
                        </span>
                    </div>

                    <div className="flex-1 flex items-center">
                        <h1 className="text-2xl font-semibold text-gray-800 leading-relaxed">
                            {props.question}
                        </h1>
                    </div>

                    <p className="mt-7 text-sm text-[#9ab195]">Tap or press space to reveal</p>
                </>
            ) : (
                <>
                    <div className="flex gap-3 mb-5">
                        <span className="bg-[#e5e8e1] text-sm px-4 py-1 rounded-full">
                            {props.subject}
                        </span>
                        <span className="bg-[#e8f1ec] text-[#4a8a7a] text-sm px-4 py-1 rounded-full">
                            Answer
                        </span>
                    </div>

                    <h1 className="text-xl font-semibold text-gray-800 leading-relaxed mb-4">
                        {props.answer}
                    </h1>

                    <p className="text-sm leading-7 text-[#5a7a50] mb-3">
                        {props.explanation}
                    </p>

                    <button
                        onClick={props.onToggleDetails}
                        className="w-fit bg-transparent border-0 p-0 text-sm text-[#8aaa80] cursor-pointer"
                    >
                        {props.showDetails ? "Less detail" : "Memory hook and source"}
                    </button>

                    {props.showDetails && (
                        <div className="mt-4 p-4 bg-[#eef1ea] rounded-2xl grid gap-2">
                            <div className="text-sm text-[#4a6741]">{props.hook}</div>
                            <div className="text-xs text-[#8aaa80]">{props.source}</div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
