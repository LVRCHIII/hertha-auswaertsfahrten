import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import type { Extensions } from '@tiptap/core'

export function getBerichtExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-hertha-mid underline hover:text-hertha-blue',
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
    Image.configure({
      inline: false,
      HTMLAttributes: {
        class: 'my-3 max-w-full rounded-lg',
      },
    }),
    Placeholder.configure({
      placeholder:
        'Wie war der Spieltag? Erzählt vom Stadion, der Stimmung und den Highlights …',
    }),
  ]
}
