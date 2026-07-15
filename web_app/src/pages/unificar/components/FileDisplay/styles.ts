import { styled } from "@/src/styles/stitches";

export const FileDisplayContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  padding: '1rem',

  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1px solid $slate300',
  borderRadius: '8px',

  color: '$slate600'
})

export const FileDisplayHeader = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '1rem',

  span: {
    display: 'flex',
    alignItems: 'center',
    background: '$slate100',
    padding: '0.5rem',
    borderRadius: '8px',
  },

  div: {
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
