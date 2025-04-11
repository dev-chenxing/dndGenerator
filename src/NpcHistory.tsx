import { GeneratedNpc } from "./typings";

export function NpcHistory(props: { activeNpcUid: string; npcHistory: GeneratedNpc[]; onLoadNpc: (npc: GeneratedNpc) => void }) {
  return (
    <div className="npc-history">
      <h2 className="font-bold">NPC History</h2>
      <div>
        <div>
          {props.npcHistory.map(({ npc, uid }) => (
            <div>
              <a className="cursor-pointer" key={uid} onClick={() => props.onLoadNpc({ npc, uid })}>
                {npc.description.name} is a {npc.description.age + " "}
                year old {npc.description.gender} {npc.description.race + " "}
                {npc.description.occupation}.
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
