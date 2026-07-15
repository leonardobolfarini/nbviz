import { styled } from "@/src/styles/stitches";

export const MainMultipleFilesInputContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '1rem',

  div: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
    background: '$blue100',
    borderRadius: '8px',
    color: '$blue600'
  },

  span: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',

    h2: {
      fontSize: '1rem',
      fontWeight: 500
    },
    p: {
      fontSize: '0.75rem',
      color: '$slate600'
    }
  }
})
