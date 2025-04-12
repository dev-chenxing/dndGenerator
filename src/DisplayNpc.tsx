import jsoncrush from "jsoncrush";
import { generate, Npc, NpcGenerateOptions } from "npc-generator";
import React from "react";
import { v4 as uuidV4 } from "uuid";
import NpcData from "./NpcData";
import { NpcHistory } from "./NpcHistory";
import { GeneratedNpc } from "./typings";
import { useNpcHistory } from "./useNpcHistory";
import UserInput from "./UserInput";

export default function DisplayNpc() {
  const [_npcUid, setNpc] = React.useState(useNpcFromQuery());
  let npcUid = _npcUid;
  const [isShowingHistory, setShowHistory] = React.useState(false);
  const { npcHistory, pushNpc } = useNpcHistory();

  const generateNpc = (npcOptions: NpcGenerateOptions) => {
    const result = generate({ npcOptions });
    const npc: GeneratedNpc = {
      npc: result.npc,
      uid: uuidV4(),
      generatedAt: new Date().toISOString(),
    };
    setShowHistory(false);
    setNpc(npc);
    pushNpc(npc);
    return npc;
  };

  // Generate initial npc, if we didn't load data from url query
  if (!npcUid) {
    npcUid = generateNpc({});
  }

  const handleToggleHistory = () => setShowHistory(!isShowingHistory);
  const handleLoadNpc = (npc: GeneratedNpc): void => {
    setNpc(npc);
    setShowHistory(false);
    document.scrollingElement?.scrollTo?.(0, 0);
  };

  return (
    <>
      <div>
        <div className="grid lg:grid-cols-3 lg:mt-10">
          <div className="mx-4 mt-4 lg:m-4">
            <div className="border p-4">
              <h1 className="font-bold">
                NPC Generator
              </h1>
              <UserInput npc={npcUid.npc} generate={generateNpc} onToggleHistory={handleToggleHistory} />
            </div>
          </div>
          <div className="border m-4 p-4 lg:col-span-2">
            {isShowingHistory ? <NpcHistory activeNpcUid={npcUid.uid || ""} npcHistory={npcHistory} onLoadNpc={handleLoadNpc} /> : <NpcData npc={npcUid.npc} />}
          </div>
        </div>
      </div>
      <div className="printing hidden">
        <h1 className="print-title">{npcUid.npc.description.name}</h1>
        <NpcData npc={npcUid.npc} />
      </div>
    </>
  );
}

function useNpcFromQuery(): GeneratedNpc | null {
  const url = new URL(window.location.href);
  if (url.searchParams.has("d")) {
    try {
      const crushedJson = url.searchParams.get("d") || "";
      const npc: Npc | null = JSON.parse(jsoncrush.uncrush(decodeURIComponent(crushedJson)));
      return npc ? { npc, uid: crushedJson } : null;
    } catch (e) {
      console.error(e);
    }
  }
  return null;
}