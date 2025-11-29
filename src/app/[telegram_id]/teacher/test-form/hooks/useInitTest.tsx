import { generateMathSATQuestions } from "@/constants/sat/math"
import { generateReadingWritingSATQuestions } from "@/constants/sat/reading-writing"
import { generateChemistrySertificateUzQuestions } from "@/constants/sertificate-uz/chemstry"
import { generateMathSertificateUzQuestions } from "@/constants/sertificate-uz/math"
import { generateRussianSertificateUzQuestions } from "@/constants/sertificate-uz/russian"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { testFromActions, initialState } from "@/store/slices/forms/test"
import { SertificateType } from "@/types/sertificate"
import { ScoringType, SATSection } from "@/types/test"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"


export const useInitTest = () => {
    const {test} = useAppSelector(state => state.test)
    const searchParams = useSearchParams()
    const dispatch = useAppDispatch()
    const {telegram_id} = useParams<{telegram_id: string}>()
    const satSection = searchParams.get('satSection')
    const sertificateType = searchParams.get('sertificateType')
    const scoringType = searchParams.get('scoringType')
    
    // Use ref to track if initialization has happened to prevent unnecessary re-initializations
    const initializedRef = useRef(false)

    useEffect(() => {
        // Check if any of the required params have changed
        const isNewSection = satSection && satSection !== test?.sat_section
        const isNewSertificateType = sertificateType && sertificateType !== test?.sertificate_type
        const isNewScoringType = scoringType && scoringType !== test?.scoring_type
        const isNewTg = telegram_id && telegram_id !== test?.teacher_id

        const shouldReset = isNewSection || isNewSertificateType || isNewScoringType || isNewTg
        
        if (shouldReset) {
            // Build the new test object with all values at once to avoid race conditions
            const newTest = {
                ...initialState.test,
                ...(satSection && { sat_section: satSection as SATSection }),
                ...(sertificateType && { sertificate_type: sertificateType as SertificateType }),
                ...(scoringType && { scoring_type: scoringType as ScoringType }),
                ...(telegram_id && { teacher_id: telegram_id }),
            }

            // Get initial questions based on the new parameters
            const initialQuestions = getInitQuestions(
                (scoringType as ScoringType) || ScoringType.RASCH_SCORING,
                sertificateType as SertificateType | undefined,
                satSection as SATSection | undefined
            )

            // Dispatch all updates in a single batch
            dispatch(testFromActions.reset())
            dispatch(testFromActions.setTest(newTest))
            dispatch(testFromActions.setQuestions(initialQuestions))
            
            initializedRef.current = true
        } else if (!initializedRef.current && (satSection || sertificateType || scoringType || telegram_id)) {
            // Initial setup when component first mounts with params
            const newTest = {
                ...initialState.test,
                ...(satSection && { sat_section: satSection as SATSection }),
                ...(sertificateType && { sertificate_type: sertificateType as SertificateType }),
                ...(scoringType && { scoring_type: scoringType as ScoringType }),
                ...(telegram_id && { teacher_id: telegram_id }),
            }

            const initialQuestions = getInitQuestions(
                (scoringType as ScoringType) || ScoringType.RASCH_SCORING,
                sertificateType as SertificateType | undefined,
                satSection as SATSection | undefined
            )

            dispatch(testFromActions.setTest(newTest))
            dispatch(testFromActions.setQuestions(initialQuestions))
            initializedRef.current = true
        }
    }, [satSection, sertificateType, scoringType, telegram_id, dispatch, test?.sat_section, test?.sertificate_type, test?.scoring_type, test?.teacher_id])
}

export const getInitQuestions = (
    scoringType: ScoringType, 
    sertificateType?: SertificateType, 
    satSection?: SATSection
) => {
    switch (scoringType) {
        case ScoringType.RASCH_SCORING:
            if (!sertificateType) return []
            switch (sertificateType) {
                case SertificateType.MATH:
                case SertificateType.PHYSICS:
                case SertificateType.HISTORY:
                case SertificateType.GEOGRAPHY:
                    return generateMathSertificateUzQuestions()
                case SertificateType.CHEMISTRY:
                case SertificateType.BIOLOGY:
                    return generateChemistrySertificateUzQuestions()
                case SertificateType.RUSSIAN:
                case SertificateType.LANGUAGE_AND_LITERATURE:
                case SertificateType.QORAQALPAK:
                    return generateRussianSertificateUzQuestions()
                default:
                    return []
            }
        case ScoringType.SAT_SCORING:
            if (!satSection) return []
            switch (satSection) {
                case SATSection.MATH:
                    return generateMathSATQuestions()
                case SATSection.READING_WRITING:
                    return generateReadingWritingSATQuestions()
                default:
                    return []
            }
        default:
            return []
    }
}