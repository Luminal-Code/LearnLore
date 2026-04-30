"use client"

import { HelpingCards } from "@/components/cards"
import { MainCard } from "@/components/main_card"
import { useEffect, useState } from "react"

const flashcards = [
    {
        id: 1,
        front: "What is photosynthesis?",
        tag: "Biology",
        type: "Definition",
        back: "The process by which green plants convert sunlight, water, and carbon dioxide into glucose and oxygen.",
        explanation: "Photosynthesis happens in chloroplasts and powers nearly every food chain on Earth.",
        hook: "Think of plants as solar-powered kitchens that cook sugar from light.",
        source: "Biology 201 - Chapter 6, Page 142",
        reviewReason: "Weak area detected - you struggled with plant energy conversion in recent practice.",
        coachTip: "Pause before revealing and try to visualize the full process from light to glucose.",
    },
    {
        id: 2,
        front: "Explain the water cycle.",
        tag: "Earth Science",
        type: "Scenario",
        back: "Evaporation, condensation, precipitation, and collection continuously move water through Earth's systems.",
        explanation: "The water cycle is powered by solar energy and gravity, which keep water moving between land, sea, and air.",
        hook: "Every drop of water keeps traveling - ocean to cloud to rain to river and back again.",
        source: "Environmental Science - Lecture 4 Notes",
        reviewReason: "This concept connects multiple earlier lessons, so it is useful for synthesis practice.",
        coachTip: "Mentally trace one water droplet through each stage before flipping the card.",
    },
    {
        id: 3,
        front: "What are the three types of rocks?",
        tag: "Geology",
        type: "Classification",
        back: "Igneous, sedimentary, and metamorphic are the three major rock types.",
        explanation: "They transform through the rock cycle over long geological timescales.",
        hook: "Igneous is fire-born, sedimentary is layered, and metamorphic is pressure-changed.",
        source: "Geology Fundamentals - Section 2.3",
        reviewReason: "You know the names, but you sometimes mix up how each one forms.",
        coachTip: "Tie each rock type to its origin story rather than memorizing the list alone.",
    },
    {
        id: 4,
        front: "Define symbiosis.",
        tag: "Ecology",
        type: "Definition",
        back: "Symbiosis is a close, long-term biological interaction between two different species.",
        explanation: "It includes mutualism, commensalism, and parasitism depending on how each organism is affected.",
        hook: "Symbiosis is basically species living in a relationship - helpful, neutral, or harmful.",
        source: "Ecology Notes - Week 7 Summary",
        reviewReason: "This idea appears often in short-answer questions and example matching.",
        coachTip: "Pair the definition with one real example so it is easier to retrieve under pressure.",
    },
    {
        id: 5,
        front: "What is the greenhouse effect?",
        tag: "Climate",
        type: "Concept",
        back: "Certain gases in the atmosphere trap heat and keep Earth warmer than it would be otherwise.",
        explanation: "The natural greenhouse effect makes Earth habitable, while excess greenhouse gases intensify warming.",
        hook: "Earth has a heat-trapping blanket, and extra gases make that blanket thicker.",
        source: "Climate Science 101 - Lecture 2, Slide 15",
        reviewReason: "This is a high-priority topic and often appears with real-world application questions.",
        coachTip: "Separate the natural greenhouse effect from human-driven warming in your mental model.",
    },
]

const gradeOptions = [
    { label: "Forgot", className: "bg-[#c0555510] text-[#c05555] border border-[#c0555520]" },
    { label: "Hard", className: "bg-[#c0904010] text-[#c09040] border border-[#c0904020]" },
    { label: "Good", className: "bg-[#5a8f5510] text-[#5a8f55] border border-[#5a8f5520]" },
    { label: "Easy", className: "bg-[#4a8a7a10] text-[#4a8a7a] border border-[#4a8a7a20]" },
]

export default function Flashcards() {
    const [cardIndex, setCardIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [grades, setGrades] = useState<Record<number, string>>({})
    const [skippedCardIds, setSkippedCardIds] = useState<number[]>([])
    const [sessionComplete, setSessionComplete] = useState(false)

    const card = flashcards[cardIndex]
    const gradedCount = Object.keys(grades).length
    const reviewedCount = gradedCount + skippedCardIds.length
    const progress = sessionComplete ? 100 : (reviewedCount / flashcards.length) * 100
    const cardsLeft = flashcards.length - reviewedCount
    const weakestTopics = Object.entries(grades)
        .filter(([, value]) => value === "Forgot" || value === "Hard")
        .map(([id]) => flashcards.find((entry) => entry.id === Number(id))?.tag)
        .filter((value): value is string => Boolean(value))
    const weakestLabel = weakestTopics[0] ?? "None"

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.code === "Space" && !flipped && !sessionComplete) {
                event.preventDefault()
                setFlipped(true)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [flipped, sessionComplete])

    function moveToNextCard() {
        if (cardIndex === flashcards.length - 1) {
            setSessionComplete(true)
            setFlipped(false)
            setShowDetails(false)
            return
        }

        setCardIndex((previousIndex) => previousIndex + 1)
        setFlipped(false)
        setShowDetails(false)
    }

    function handleGrade(grade: string) {
        setGrades((previousGrades) => ({
            ...previousGrades,
            [card.id]: grade,
        }))

        moveToNextCard()
    }

    function handleSkip() {
        setSkippedCardIds((previousIds) =>
            previousIds.includes(card.id) ? previousIds : [...previousIds, card.id]
        )

        moveToNextCard()
    }

    function resetSession() {
        setCardIndex(0)
        setFlipped(false)
        setShowDetails(false)
        setGrades({})
        setSkippedCardIds([])
        setSessionComplete(false)
    }

    return (
        <main className="min-h-screen bg-[#eef1ea] flex justify-center">
            <div className="fixed top-0 left-0 w-full bg-[#eef1ea]/90 backdrop-blur-sm border-b border-gray-300 px-4 py-3 flex flex-col gap-3 md:px-6 md:flex-row md:items-center md:justify-between z-50">
                <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                    <div className="w-2 h-2 bg-green-700 rounded-full" />

                    <div>
                        <h1 className="text-sm font-semibold">Natural Sciences</h1>
                        <p className="text-xs text-gray-500">Midterm Review</p>
                    </div>

                    <span className="bg-[#e5e8e1] text-[#4a6741] text-xs px-4 py-1 rounded-full">
                        Review Queue
                    </span>
                </div>

                <div className="flex items-center gap-3 w-full md:w-[30%]">
                    <span className="text-sm whitespace-nowrap">
                        {sessionComplete ? flashcards.length : cardIndex + 1} / {flashcards.length}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#8fb583] to-[#6b8f63] rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-auto">
                    <span className="text-sm text-gray-600">
                        {sessionComplete ? "Session complete" : "7 min - 82% confident"}
                    </span>
                    <button className="bg-[#e5e8e1] px-4 py-1 rounded-full text-sm">
                        Pause
                    </button>
                </div>
            </div>

            <div className="w-full max-w-[1140px] grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 pt-40 md:pt-28 px-4 md:px-6 pb-16">
                <div className="flex flex-col items-center">
                    {sessionComplete ? (
                        <div className="w-full max-w-[600px] bg-[#f7f8f5] rounded-3xl shadow-md px-6 py-8 md:px-10 md:py-10 text-center grid gap-6">
                            <div className="grid gap-2">
                                <div className="text-4xl">Session Complete</div>
                                <h2 className="text-3xl font-semibold text-gray-800">
                                    You finished this flashcard set
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {flashcards.length} cards reviewed. Here is a quick view of your progress.
                                </p>
                            </div>

                            <div className="flex gap-2 justify-center flex-wrap">
                                {Object.entries(grades).map(([id, grade]) => {
                                    const gradedCard = flashcards.find((entry) => entry.id === Number(id))
                                    const option = gradeOptions.find((entry) => entry.label === grade)

                                    return (
                                        <span
                                            key={id}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${option?.className ?? "bg-[#e5e8e1] text-gray-700"}`}
                                        >
                                            {gradedCard?.tag}: {grade}
                                        </span>
                                    )
                                })}

                                {skippedCardIds.length > 0 && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#e5e8e1] text-gray-700">
                                        Skipped: {skippedCardIds.length}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                <div className="rounded-2xl bg-[#eef1ea] px-4 py-4">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Completion</p>
                                    <p className="text-2xl font-semibold text-gray-800">100%</p>
                                </div>
                                <div className="rounded-2xl bg-[#eef1ea] px-4 py-4">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Cards Graded</p>
                                    <p className="text-2xl font-semibold text-gray-800">{gradedCount}</p>
                                </div>
                                <div className="rounded-2xl bg-[#eef1ea] px-4 py-4">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Cards Skipped</p>
                                    <p className="text-2xl font-semibold text-gray-800">{skippedCardIds.length}</p>
                                </div>
                                <div className="rounded-2xl bg-[#eef1ea] px-4 py-4">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Weakest Topic</p>
                                    <p className="text-2xl font-semibold text-gray-800">{weakestLabel}</p>
                                </div>
                            </div>

                            <p className="text-sm text-[#5a7a50]">
                                Next review: Tomorrow morning - keep going while recall is still fresh.
                            </p>

                            <div>
                                <button
                                    onClick={resetSession}
                                    className="bg-[#5f7f5f] text-white px-8 py-3 rounded-2xl font-medium hover:bg-[#4e6d4e] transition"
                                >
                                    Start Again
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <MainCard
                                subject={card.tag}
                                type={card.type}
                                question={card.front}
                                answer={card.back}
                                explanation={card.explanation}
                                hook={card.hook}
                                source={card.source}
                                showAnswer={flipped}
                                showDetails={showDetails}
                                onToggleDetails={() => setShowDetails((previous) => !previous)}
                            />

                            <div className="mt-6 flex gap-3 flex-wrap justify-center">
                                {!flipped ? (
                                    <>
                                        <button
                                            onClick={() => setFlipped(true)}
                                            className="bg-[#5f7f5f] text-white px-10 py-3 rounded-2xl font-medium hover:bg-[#4e6d4e] transition"
                                        >
                                            Show Answer
                                        </button>
                                        <button
                                            onClick={handleSkip}
                                            className="bg-[#e5e8e1] text-gray-700 px-6 py-3 rounded-2xl text-sm hover:bg-[#d6dad2] transition"
                                        >
                                            Skip
                                        </button>
                                    </>
                                ) : (
                                    gradeOptions.map((option) => (
                                        <button
                                            key={option.label}
                                            onClick={() => handleGrade(option.label)}
                                            className={`px-7 py-3 rounded-2xl text-sm font-semibold transition hover:-translate-y-0.5 ${option.className}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-6">
                    <HelpingCards
                        heading="Why This Card?"
                        content={
                            sessionComplete
                                ? `You completed all ${flashcards.length} cards in this set.
Your weakest area today was ${weakestLabel}.`
                                : card.reviewReason
                        }
                    />

                    <HelpingCards
                        heading="Coach"
                        content={
                            sessionComplete
                                ? "Review your Forgot and Hard cards first in the next round for faster gains."
                                : card.coachTip
                        }
                    />

                    <HelpingCards
                        heading="Session"
                        content={
                            sessionComplete
                                ? `${gradedCount} cards graded
${skippedCardIds.length} cards skipped
Ready for another pass`
                                : `${cardsLeft} cards left
${weakestTopics.length} weak concepts ahead
~ 6 mins remaining`
                        }
                    />
                </div>
            </div>
        </main>
    )
}
