export function deserializeVssJsonObject<T>(text: string): T | null {
 return JSON.parse(text) as T;   
}