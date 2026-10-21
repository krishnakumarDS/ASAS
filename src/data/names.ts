// Names that are shown differently from how the database stores them. The key is the stored name (compared ignoring letter case and extra spaces),
// the value is what the screens show. Applied where developer / consultant names are read from SQL, so lists, filters and counts all agree.
// The database itself is not changed: renaming the record (Edit on its page) makes this entry unnecessary.
const SHOWN_AS: Record<string, string> = {
  'kifaf development': 'Al Kifaf Development',
}
const key = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase()

export const fixName = (name: string): string => SHOWN_AS[key(name)] ?? name
