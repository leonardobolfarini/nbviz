import { colors } from "@/src/styles/colors";
import { styled } from "@/src/styles/stitches";

export const MainContainer = styled("div", {
  marginTop: "2rem",
  padding: "1rem",

  border: "1px solid $slate300",
  borderRadius: "8px",

  backgroundColor: "$white",
})

export const ContainerHead = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "4px",

  marginBottom: "2rem",

  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",

    gap: "0.5rem",

    "@mobile": {
      svg: {
        display: "none",
      },
    },

    h1: {
      fontSize: "1.5rem",
      fontWeight: "600",

      "@mobile": {
        fontSize: "1rem",
        fontWeight: "500",
      },
    },
  },
  footer: {
    fontSize: "0.875rem",
    color: "$slate500",

    "@mobile": {
      fontSize: "0.75rem",
    },
  },
})

export const FilesForm = styled("form", {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
})

export const DatabaseChose = styled("div", {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',

  h2: {
    fontSize: '0.875rem',
    color: colors.slate600
  },

  div: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
  },
})

export const DatabaseSelection = styled('span', {
  fontSize: '0.875rem',
  fontWeight: '500',
  color: colors.slate500,

  padding: '0.5rem 1rem',
  border: `2px solid ${colors.slate300}`,
  borderRadius: '8px',

  transition: 'all 0.2s',

  variants: {
    isSelected: {
      true: {
        cursor: 'default',

        borderColor: colors.blue500,
        color: colors.blue500,
        background: colors.blue100
      },
      false: {
        cursor: 'pointer',

        '&:hover': {
          borderColor: colors.slate400
        },
      }
    }
  }
})

export const FilesInputContainer = styled("div", {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',

  label: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '0.25rem',

    borderRadius: '8px',
    padding: '0 1rem',
    background: '$slate800',
    color: '$white',
    fontWeight: 600,

    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 0,

    '&:hover': {
      background: '$slate700'
    },
  },

  input: {
    display: 'none'
  }
})

export const FilesDisplay = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
})

export const FilesFormButton = styled("button", {
  width: '30%',
  alignSelf: 'center',

  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',

  fontSize: '1rem',
  fontWeight: 500,

  padding: '1rem 0',
  border: 0,
  borderRadius: '8px',
  color: '$slate100',
  background: '$slate800',

  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    background: '$slate700'
  },

  '&:disabled': {
    cursor: 'not-allowed',
    background: '$slate500'
  }
})


export const GeneratedFileContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: "2rem",
  padding: "1rem",

  border: "1px solid $slate300",
  borderRadius: "8px",

  backgroundColor: "$white",

  h2: {
    fontSize: '1.25rem'
  }
})
