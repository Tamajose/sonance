import { supabase } from "../lib/supabase";

export const stripHtml = (h = "") =>
    h
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const call = async (body) => {
    const { data, error } = await supabase.functions.invoke("ai", { body });
    if (error) {
        console.log("AI call error: ", error);
        return { success: false };
    }
    return { success: true, data };
};

export const moderateContent = async ({ text, imageBase64 }) => {
    const res = await call({ action: "moderate", text, imageBase64 });
    return res.success ? res.data.allowed : true;
};

export const analyzeContent = ({ text, imageBase64 }) =>
    call({ action: "analyze", text, imageBase64 });

export const embedText = async (text) => {
    const res = await call({ action: "embed", text });
    return res.success ? res.data.embedding : null;
};
