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
  gap: '2rem'
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
  cursor: 'pointer',

  transition: 'all 0.2s',

  '&:hover': {
    borderColor: colors.slate400
  },

  variants: {
    isSelected: {
      'true': {
        borderColor: colors.blue500,
        color: colors.blue500,
        background: colors.blue100
      }
    }
  }
})

export const FilesInputContainer = styled("div", {

})
