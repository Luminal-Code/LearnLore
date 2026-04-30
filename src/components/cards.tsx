interface HelpingCardsProps {
    heading: string;
    content: string;
}

export function HelpingCards(props: HelpingCardsProps){
    return(
        <div className="grid gap-2 border-1 border-gray-400 w-[12rem] rounded-2xl py-4 px-3">
            <h2 className="text-[0.8rem] font-bold">
                {props.heading}
            </h2>
            <pre className="w-full whitespace-pre-wrap text-[.78rem]">
                {props.content}
            </pre>
        </div>
    )
}