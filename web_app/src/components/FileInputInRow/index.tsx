import {
  Check,
  CheckCircle,
  FileText,
  Upload,
} from "@phosphor-icons/react/dist/ssr";
import { colors } from "@/src/styles/colors";
import React, {
  forwardRef,
  useRef,
  useState,
  useMemo,
  useImperativeHandle,
} from "react";
import { FileInputContent, FileInputLabel, FileInputStyle } from "./styles";
import { formatBytes } from "@/src/utils/formatBytes";

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  idhtml: string;
  database?: string;
}

export const FileInputInRow = forwardRef<HTMLInputElement, FileInputProps>(
  function FileInput(props: FileInputProps, ref) {
    const { idhtml, database, value, onChange, ...rest } = props;
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current!);

    const file = useMemo(() => {
      if (
        typeof FileList !== "undefined" &&
        value instanceof FileList &&
        value.length > 0
      ) {
        return [value[0].name, value[0].size];
      }
      return null;
    }, [value]);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      if (onChange) {
        onChange(event);
      }
    }

    return (
      <FileInputLabel htmlFor={idhtml}>
        <FileInputContent>
          <div>
            <header
              style={{
                background: file ? colors.green100 : colors.slate300,
              }}
            >
              {file ? (
                <CheckCircle size={24} color={colors.green600} />
              ) : (
                <FileText size={24} />
              )}
            </header>
            {file ? (
              <span>
                <p>{file[0]}</p>
                <footer>{formatBytes(Number(file[1]))}</footer>
              </span>
            ) : (
              <span>
                <p>Nenhum arquivo selecionado.</p>
                <footer>CSV ou TXT</footer>
              </span>
            )}
          </div>

          <span>
            <Upload size={20} />
            Selecionar
          </span>
        </FileInputContent>

        <FileInputStyle
          id={idhtml}
          type="file"
          accept={props.accept}
          onChange={handleChange}
          ref={inputRef}
          {...rest}
        />
      </FileInputLabel>
    );
  },
);
