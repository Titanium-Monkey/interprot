import React, { useMemo } from "react";
import { redColorMapHex, tokenToResidue } from "../utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { tokensToSequence } from "../utils";

export interface SeqFormat {
  dimension: number;
  feature_name?: string;
  examples: SingleSeq[];
}

export interface SingleSeq {
  alphafold_id: string;
  tokens_acts_list: Array<number>;
  tokens_list: Array<number>;
}

interface SeqViewerProps {
  seq: Omit<SingleSeq, "alphafold_id"> & { alphafold_id?: string };
}

function getFirstNonZeroIndex(arr: Array<number>) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== 0) {
      return i;
    }
  }
  return 0;
}

/**
 * This component takes in a SingleSeq and renders the sequence with the corresponding colors
 */
const SeqViewer: React.FC<SeqViewerProps> = ({ seq }) => {
  const maxValue = useMemo(() => {
    return Math.max(...seq.tokens_acts_list);
  }, [seq.tokens_acts_list]);
  const firstNonZero = getFirstNonZeroIndex(seq.tokens_acts_list);

  const startIdx = Math.max(firstNonZero - 30, 0);

  const tokensToShow = seq.tokens_list.slice(startIdx);
  const activationsToShow = seq.tokens_acts_list.slice(startIdx);

  const copySequenceToClipboard = () => {
    navigator.clipboard.writeText(tokensToSequence(seq.tokens_list));
  };

  return (
    <div className="inline-flex" style={{ cursor: "pointer" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        onClick={copySequenceToClipboard}
        style={{ marginRight: 4, position: "relative", top: "50%", transform: "translateY(40%)" }}
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      {startIdx > 0 && (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              <span style={{ color: "gray" }}>+{startIdx}</span>
              ...
            </TooltipTrigger>
            <TooltipContent>
              The number of amino acids hidden in this sequence
              {seq.alphafold_id && <span> (AlphaFoldDB ID: {seq.alphafold_id})</span>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {tokensToShow.map((token, index) => {
        const color = redColorMapHex(activationsToShow[index], maxValue);
        const tokenChar = tokenToResidue(token);
        return (
          <TooltipProvider key={`token-${index}`} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger>
                <span
                  key={`${token}-${color}`}
                  style={{
                    backgroundColor: color,
                    borderRadius: 2,
                    letterSpacing: -1,
                  }}
                >
                  {tokenChar}
                </span>
              </TooltipTrigger>
              <TooltipContent onClick={copySequenceToClipboard} style={{ cursor: "pointer" }}>
                Copy
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default SeqViewer;
