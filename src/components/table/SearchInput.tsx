import * as React from "react";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
interface Props {
  placeHolder: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled: boolean;
  value: string;
}

export default function SearchInput({
  placeHolder,
  onChange,
  disabled,
  value,
}: Props) {
  return (
    <div className="border border-primary-500 flex items-center rounded-xl bg-white h-[42px] font-[inherit] px-2">
      <input
        className="appearance-none w-full outline-none"
        placeholder={placeHolder}
        onChange={onChange}
        value={value}
        disabled={disabled}
      />
      <IconButton type="button" aria-label="search">
        <SearchIcon />
      </IconButton>
    </div>
  );
}
