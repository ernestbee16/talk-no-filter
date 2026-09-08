"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatAiAssistant = chatAiAssistant;
// Emergency safety triggers list
const EMERGENCY_KEYWORDS = [
    'assault',
    'rape',
    'overdose',
    'bleeding',
    'suicide',
    'kill myself',
    'difficulty breathing',
    'severe pain',
];
/**
 * AI Health Assistant Endpoint
 * Educational SRH guidance strictly following WHO and RBC guidelines.
 */
async function chatAiAssistant(req, res) {
    try {
        const { prompt, language = 'en' } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        const lowercasePrompt = prompt.toLowerCase();
        // Check emergency triggers
        const isEmergency = EMERGENCY_KEYWORDS.some((kw) => lowercasePrompt.includes(kw));
        let responseText = '';
        let category = 'general_srh';
        let isUrgent = false;
        if (isEmergency) {
            isUrgent = true;
            category = 'emergency_escalation';
            responseText = `⚠️ CRITICAL SAFETY NOTICE: Your query mentions urgent health or physical distress. If you or someone you know is in immediate danger, experiencing severe symptoms, or has experienced assault, please connect with emergency medical services immediately:\n\n• RBC Toll-Free Crisis Hotline: Dial 114 (Rwanda)\n• Gender-Based Violence & Support Line: Dial 3580\n• Emergency Medical Services: Dial 112\n\nOur verified medical practitioners are also available for private, confidential guidance.`;
        }
        else if (lowercasePrompt.includes('pep') || lowercasePrompt.includes('post-exposure')) {
            category = 'hiv_pep';
            responseText = `HIV Post-Exposure Prophylaxis (PEP) is an emergency antiretroviral treatment that must be initiated within 72 hours (ideally within 24 hours) after potential exposure to HIV.\n\n• Timeline: Must start within 72 hours max.\n• Duration: 28-day continuous course.\n• Where to get it: Available free or low-cost at all RBC-certified district hospitals and health centers in Rwanda.\n\nWould you like to speak directly with an online practitioner or view nearby clinics?`;
        }
        else if (lowercasePrompt.includes('prep') || lowercasePrompt.includes('pre-exposure')) {
            category = 'hiv_prep';
            responseText = `HIV Pre-Exposure Prophylaxis (PrEP) is a daily oral pill or long-acting injectable that reduces the risk of acquiring HIV from sex by over 99% when taken as prescribed.\n\n• Who it is for: Anyone seeking proactive HIV prevention.\n• Testing required: Baseline HIV negative test and kidney function check.\n• Access: Distributed free of charge across public health clinics in Rwanda.`;
        }
        else if (lowercasePrompt.includes('pills') || lowercasePrompt.includes('contraceptive') || lowercasePrompt.includes('birth control')) {
            category = 'contraception';
            responseText = `Modern contraceptive options include daily oral pills, hormonal implants (Jadelle/Implanon), IUDs, and barrier methods (condoms).\n\n• Myth Check: Contraceptive pills do NOT cause permanent infertility or accumulate in the stomach.\n• Efficacy: Oral pills are 93-99% effective when taken daily at the same time.\n• STI Protection: Note that oral pills do not prevent STIs—use condoms for dual protection.`;
        }
        else {
            responseText = `Thank you for consulting Talk No Filter Health Assistant. Based on WHO & RBC clinical guidelines, all reproductive health questions can be addressed privately and without judgment.\n\n• Educational Note: This assistant provides evidence-based information but does not issue formal medical diagnoses.\n• Next Step: You can submit an anonymous Q&A to our practitioner board, explore our Myth vs. Fact Hub, or book a 15-minute private consultation.`;
        }
        return res.status(200).json({
            prompt,
            response: responseText,
            category,
            isEmergency: isUrgent,
            emergencyContacts: isUrgent
                ? [
                    { name: 'RBC Crisis Hotline', phone: '114', note: 'Toll-Free (Rwanda)' },
                    { name: 'Isange One Stop Center', phone: '3580', note: 'GBV & Assault Support' },
                ]
                : null,
            disclaimer: 'Educational information based on WHO & RBC guidelines. Not a substitute for clinical diagnosis.',
        });
    }
    catch (error) {
        console.error('AI Assistant Error:', error);
        return res.status(500).json({ error: 'Failed to process AI health inquiry' });
    }
}
