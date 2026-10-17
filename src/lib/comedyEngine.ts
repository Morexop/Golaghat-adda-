import { JokeItem, SchemeCategory } from '../types/comedy';
import { jokesMoina } from '../data/jokesMoina';
import { jokesBabu } from '../data/jokesBabu';

/**
 * Returns the joke array for a specified category
 */
export function getJokesForCategory(category: SchemeCategory): JokeItem[] {
  if (category === 'moina') {
    return jokesMoina;
  }
  return jokesBabu;
}

/**
 * Picks a random joke from the category list, ensuring it's not the same
 * as the previous joke (if list has > 1 item).
 */
export function getRandomJoke(
  category: SchemeCategory,
  previousJokeId?: string
): JokeItem {
  const jokes = getJokesForCategory(category);
  if (!jokes || jokes.length === 0) {
    throw new Error(`No jokes found for category: ${category}`);
  }

  if (jokes.length === 1) {
    return jokes[0];
  }

  // Filter out previous joke if possible
  const pool = previousJokeId
    ? jokes.filter((j) => j.id !== previousJokeId)
    : jokes;

  const selectedIndex = Math.floor(Math.random() * pool.length);
  return pool[selectedIndex] || jokes[0];
}

/**
 * Formats a comedy joke item into a shareable text message for WhatsApp/Socials
 */
export function formatJokeForSharing(joke: JokeItem): string {
  const schemeName = joke.category === 'moina' ? 'Moina Asoni (Female 👧)' : 'Babu Asoni (Male 👦)';
  return `😂 *GOLAGHAT ADDA - Assamese Comedy Edition* 😂\n\n📌 Category: ${schemeName}\n💬 "${joke.textAssamese}"\n\n⚡ Punchline: ${joke.punchline}\n\n👉 Aji tumar reaction ki? Join Golaghat Public Adda!`;
}
