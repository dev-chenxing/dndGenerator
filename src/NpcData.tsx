import { Npc, NpcAbilities } from "npc-generator";
import { Component } from "react";

const abilities: { key: keyof NpcAbilities; name: string }[] = [
	{ key: "strength", name: "Strength" },
	{ key: "dexterity", name: "Dexterity" },
	{ key: "constitution", name: "Constitution" },
	{ key: "intelligence", name: "Intellect" },
	{ key: "wisdom", name: "Wisdom" },
	{ key: "charisma", name: "Charisma" },
];

const subclasses: Record<string, string[]> = {
  "barbarian": ["Path of the Battlerager", "Path of the Berserker", "Path of the Totem Warrior"],
  "bard": ["College of Lore", "College of Valor"],
  "cleric": ["Arcana Domain", "Death Domain", "Knowledge Domain", "Life Domain", "Light Domain", "Nature Domain", "Tempest Domain", "Trickery Domain", "War Doamin"],
  "druid": ["Circle of the Land", "Circle of the Moon"],
  "fighter": ["Battle Master", "Champion", "Eldrith Knight", "Purple Dragon Knight"],
  "monk": ["Way of the Four Elements", "Way of the Long Death", "Way of the Open Hand", "Way of the Sun Soul", "Way of Shadow"],
  "paladin": ["Oath of the Ancients", "Oath of the Crown", "Oath of Devotion", "Oath of Vengeance", "Oathbreaker"],
  "ranger": ["Beast Master", "Hunter"],
  "rogue": ["Arcane Trickster", "Assassin", "Mastermind", "Thief", "Swashbuckler"],
  "sorcerer": ["Draconic Bloodline", "Storm Sorcery", "Wild Magic"],
  "warlock": ["The Archfey", "The Fiend", "The Great Old One", "The Undying"],
  "wizard": ["Bladesinging", "School of Abjuration", "School of Conjuration", "School of Divination", "School of Enchantment", "School of Evocation", "School of Illusion", "School of Necromancy", "School of Transmutation"],
}

const randomElement = (array: Array<any>) => array[Math.floor(Math.random() * array.length)];
const toTitleCase = (sentence: string) => sentence.replace(
  /\b[a-z]/g, 
  firstCharOfWord => firstCharOfWord.toUpperCase()
)


function toFeet(n: number) {
	const realFeet = (n * 0.3937) / 12;
	const feet = Math.floor(realFeet);
	const inches = Math.floor((realFeet - feet) * 12);
	return feet + "'" + inches + '"';
}

function renderAbility(abilityBase: number) {
	const ability = Math.max(3, abilityBase);
	// Info on modifiers
	// https://dnd5e.info/using-ability-scores/ability-scores-and-modifiers/
	const modifier = Math.floor((ability - 10) / 2);
	return `${ability} [${modifier <= 0 ? modifier : `+${modifier}`}]`;
}

interface IProps {
	npc: Npc | null;
}

export default class NpcData extends Component<IProps> {
	render() {
		const { npc } = this.props;
		if (!npc) {
			return <div>Loading npc...</div>;
		}

		const majP = npc.description.pronounCapit;
		//const minP = npc.description.pronounMinus;
		const quirksArray = npc.pquirks.description.split(".");
		quirksArray.length--;

		if (npc.description.race === "lizardman" || npc.description.race === "lizardwoman") {
			npc.ptraits.traits1 = npc.ptraits.traitslizards;
		}
		if (npc.description.race === "goliath") {
			npc.ptraits.traits1 = npc.ptraits.traitsgoliaths;
		}
		if (npc.description.race === "kenku") {
			npc.description.name = npc.description.kenkuname;
		}

		const specialPhysical1 =
			npc.physical.special1 !== "" ? (
				<div>
					<p hidden>#</p>
					<p>{npc.physical.special1}</p>
				</div>
			) : null;
		const specialPhysical2 =
			npc.physical.special2 !== "" ? (
				<div>
					<p hidden>#</p>
					<p>{npc.physical.special2}</p>
				</div>
			) : null;

		const alignment = () => {
			let mornalAlignment = null
      let ethicalAlignment = null
			let tendency = 0
			for (const [k, v] of Object.entries({Good: npc.alignment.good, Neutral: npc.alignment.moralneutral, Evil: npc.alignment.evil})) {
				if (v >= tendency) {
					mornalAlignment = k;
					tendency = v
				}
			}
      tendency = 0
      for (const [k, v] of Object.entries({Chaotic: npc.alignment.chaotic, Neutral: npc.alignment.ethicalneutral, Lawful: npc.alignment.lawful})) {
				if (v >= tendency) {
					ethicalAlignment = k;
					tendency = v
				}
			}
      if (ethicalAlignment == "Neutral" && mornalAlignment == "Neutral") return "True Neutral" 
			return `${ethicalAlignment} ${mornalAlignment}`
		}

    const subclass = subclasses[npc.description.occupation] ? ` (${randomElement(subclasses[npc.description.occupation])})` : null

		return (
			<div className="grid gap-2" id="downloadData">
				<div className="grid md:grid-cols-2 gap-2">
					<div className="border px-4 py-2">
						<h2 className="font-bold">Description</h2>
						<div data-test="npc-description">
							<p hidden>#</p>
							<p>
								{npc.description.name} is a {npc.description.age + " "}
								year old {npc.description.gender} {toTitleCase(npc.description.race) + " "}
								{toTitleCase(npc.description.occupation)}{subclass}.
							</p>
							<p hidden>#</p>
							<p>
								{majP}has {npc.physical.hair}
								{npc.physical.eyes}.
							</p>
							<p hidden>#</p>
							<p>
								{majP}has {npc.physical.skin}.
							</p>
							<p hidden>#</p>
							<p>
								{majP}stands {npc.physical.height}cm ({toFeet(npc.physical.height)}) tall and has {npc.physical.build}.
							</p>
							<p hidden>#</p>
							<p>
								{majP}has {npc.physical.face}.
							</p>
							<p hidden>#</p>
							{specialPhysical1}
							{specialPhysical2}
							<p hidden>#</p>
							<p hidden>#</p>
						</div>
					</div>
					<div className="border px-4 py-2">
						<h2 className="font-bold">Personality Traits</h2>
						<div data-test="npc-personality">
							<p hidden>#</p>
							<p>{npc.religion.description}</p>
							<p hidden>#</p>
							<p>{npc.ptraits.traits1}</p>
							<p hidden>#</p>
							<p>{npc.ptraits.traits2}</p>
							{quirksArray.map((value) => (
								<p key={value}>{value}.</p>
							))}
							<p hidden>#</p>
							<p hidden>#</p>
						</div>
					</div>
				</div>
				<div className="grid md:grid-cols-3 gap-2">
					<div className="border px-4 py-2">
						<h2 className="font-bold">Ability Scores</h2>
						<div data-test="npc-ability-table">
							<table className="w-full">
								<tbody>
									{abilities.map(({ key, name }) => {
										const ability = npc.abilities[key];
										return (
											<tr key={key}>
												<td>
													<b>{name}</b>
												</td>
												<td className="ability-number">
													{renderAbility(ability)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
							<p hidden>#</p>
						</div>
					</div>
					<div className="border px-4 py-2">
						<h2 className="font-bold">Relationships</h2>
						<div data-test="npc-relationships">
							<p hidden>#</p>
							<p>
								<b>Sexual Orientation </b>
							</p>
							<p hidden>- </p>
							<p>{npc.relationship.orientation}</p>
							<p hidden>#</p>
							<p>
								<b>Relationship Status </b>
							</p>
							<p hidden>- </p>
							<p>{npc.relationship.status}</p>
							<p hidden>#</p>
							<p hidden>#</p>
						</div>
					</div>
					<div className="border px-4 py-2">
						<h2 className="font-bold">Alignment</h2>
						<p>{alignment()}</p>
					</div>
				</div>
				<div className="border px-4 py-2">
					<h2 className="font-bold">Plot Hook</h2>
					<div data-test="npc-plot-hook">
						{npc.hook.description}
					</div>
				</div>
			</div>
		);
	}
}
