import copy from "copy-to-clipboard";
import jsoncrush from "jsoncrush";
import { getNpcOptionsValues, Npc, NpcGenerateOptions } from "npc-generator";
import { Component } from "react";
import Footer from "./Footer";

const { alignments, occupations, classes, races } = getNpcOptionsValues();

const filteredRaces = ["Aasimar", "Dragonborn", "Dwarf", "Elf", "Gnome", "Goblin", "Halfling", "Half-Elf", "Half-Orc", "Human", "Tiefling"]
const genders =  [{name: "Female", value: 1}, {name: "Male", value: 0}]
const filteredClasses = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"]

interface IProps {
  npc: Npc;
  generate: (options: NpcGenerateOptions) => void;
  onToggleHistory: () => void;
}

interface IState {
  npcOptions: NpcGenerateOptions;
  wasCopiedToClipboard?: boolean;
}

type UserOption = {
  name: string;
  value: number;
};

const classOccupationValue = occupations.find((o) => !!o.classes)?.value ?? -1;
// const professionOccupationValue = occupations.find((o) => !!o.professions)?.value ?? -1;



const userOptions: {
  label: string;
  optionName: keyof NpcGenerateOptions;
  options: UserOption[] | ((npcOptions: NpcGenerateOptions) => UserOption[]);
  condition?: (npcOptions: NpcGenerateOptions) => boolean;
  onChange?: (component: Component<IProps, IState>) => void;
}[] = [
    {
      label: "Race",
      optionName: "race",
      options: () => races.filter((race) => filteredRaces.includes(race.name)),
      onChange: (component) => {
        const npcOptions = component.state.npcOptions;
        npcOptions.subrace = null;
        component.setState({ npcOptions });
      },
    },
    {
      label: "Subrace",
      optionName: "subrace",
      condition: (npcOptions) => typeof npcOptions.race === "number" && !!races[npcOptions.race].subraces?.length,
      options: (npcOptions) => races[npcOptions.race || 0]?.subraces || [],
    },
    {
      label: "Gender",
      optionName: "gender",
      options: genders,
    },
    {
      label: "Alignment",
      optionName: "alignment",
      options: () => {
        return alignments;
      },
    },
    // {
    //   label: "Plot Hooks",
    //   optionName: "plothook",
    //   options: plothooks,
    // },
    // {
    //   label: "Occupation",
    //   optionName: "classorprof",
    //   options: occupations,
    //   onChange: (component) => {
    //     const npcOptions = component.state.npcOptions;
    //     npcOptions.occupation1 = null;
    //     npcOptions.occupation2 = null;
    //     component.setState({ npcOptions });
    //   },
    // },
    {
      label: "Class",
      optionName: "occupation1",
      // condition: (npcOptions) => npcOptions.classorprof === classOccupationValue,
      options:  () => classes.filter((class_) => filteredClasses.includes(class_.name)),
    },
    // {
    //   label: "Social Class",
    //   optionName: "occupation1",
    //   condition: (npcOptions) => npcOptions.classorprof === professionOccupationValue,
    //   options: professions,
    //   onChange: (component) => {
    //     const npcOptions = component.state.npcOptions;
    //     npcOptions.occupation2 = null;
    //     component.setState({ npcOptions });
    //   },
    // },
    // {
    //   label: "Profession",
    //   optionName: "occupation2",
    //   condition: (npcOptions) => npcOptions.classorprof === professionOccupationValue && typeof npcOptions.occupation1 === "number",
    //   options: (npcOptions) => professions[npcOptions.occupation1 || 0]?.professionCategories || [],
    // },
  ];

export default class UserInput extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      npcOptions: {},
    };
  }

  onSubmit = () => {
    this.props.generate(this.state.npcOptions);
  };

  private getCharacterText() {
    const elementData = document.getElementById("downloadData");

    if (!elementData) {
      alert("Unable to find character data");
      throw new Error("Missing element downloadData");
    }

    const body = (elementData.textContent || "").split("#").join("\r\n").split("#").join("\r\n");
    return body;
  }

  private getExportFileName() {
    const name = this.props.npc.description.name.split(" ")[0];
    const gender = this.props.npc.description.gender;
    const race = this.props.npc.description.race.split(" ").join("_");
    const occupation = this.props.npc.description.occupation.split(" ").join("_");

    const filename = name + "_" + gender + "_" + race + "_" + occupation;

    return filename;
  }

  private downloadTxtFile: React.MouseEventHandler<HTMLButtonElement> = (ev) => {
    ev.stopPropagation();

    const element = document.createElement("a");
    const characterDetails = this.getCharacterText();
    const file = new Blob([characterDetails], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = this.getExportFileName() + ".txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // Do not leave the button in focus after clicking it
    ev.currentTarget.blur();
    return false;
  };

  private copyNpcToClipboard: React.MouseEventHandler<HTMLButtonElement> = (ev) => {
    ev.stopPropagation();
    const header = this.getExportFileName();
    const characterDetails = this.getCharacterText();
    const success = copy(`${header}\n${characterDetails}`, {
      // Fallback message if browser doesn't support clipboard API
      message: "Copy NPC",
      debug: process.env.NODE_ENV === "development",
    });

    if (success) {
      this.setState({ wasCopiedToClipboard: true });
    }

    return false;
  };

  renderCopyToClipboardButton() {
    const { wasCopiedToClipboard } = this.state;

    if (wasCopiedToClipboard) {
      return (
        <button
          className="border py-1 cursor-pointer"
          title="Copied to clipboard"
          data-test="copy-button"
          onBlur={() => void this.setState({ wasCopiedToClipboard: false })}
        >
          Copied!
        </button>
      );
    }
    return (
      <button className="border py-1 cursor-pointer" title="Copy character to clipboard" data-test="copy-button" onClick={this.copyNpcToClipboard}>
        Copy to Clipboard
      </button>
    );
  }

  render() {
    const npcOptions = userOptions.map((userOption) => {
      const enable = !(userOption.condition && !userOption.condition(this.state.npcOptions));

      if (userOption.condition && !userOption.condition(this.state.npcOptions)) {
        // Comment this if you want the disabled option
        return null;
      }

      let options: React.ReactNode[] = [];
      const selectedOption = this.state.npcOptions[userOption.optionName];
      if (enable) {
        let opts = userOption.options;
        if (typeof opts === "function") {
          opts = opts(this.state.npcOptions);
        }
        options = opts.map((opt, i) => {
          if (!opt.name) {
            return null;
          }
          return (
            <option value={opt.value} key={i}>
              {opt.name}
            </option>
          );
        });
      }
      this.state.npcOptions.classorprof = classOccupationValue

      return (
        <div key={userOption.label} className="my-2">
          <form className="flex justify-between items-center">
            <label>{userOption.label}</label>
            <select
              className="w-36 border p-2 bg-black"
              value={selectedOption ?? undefined}
              onChange={(e: any) => {
                const npcOptions = this.state.npcOptions;
                npcOptions[userOption.optionName] = e.target.value === "random" ? null : parseInt(e.target.value);
                this.setState({ npcOptions }, () => {
                  if (userOption.onChange) {
                    userOption.onChange(this);
                  }
                });
              }}
              disabled={!enable}
            >
              <option value="random" key="random">
                Random
              </option>
              {options}
            </select>
          </form>
        </div>
      );
    });

    const npcDataUrl = new URL(window.location.href);
    npcDataUrl.searchParams.set("d", jsoncrush.crush(JSON.stringify(this.props.npc)));

    return (
      <div>
        <div className="npc-options">{npcOptions}</div>
        <div className="grid grid-cols-auto gap-2 my-4">
          <button className="generate-button border py-1 cursor-pointer" title="Generate" data-test="generate-button" onClick={this.onSubmit}>Generate</button>
          <button className="border py-1 cursor-pointer" title="Export character to .txt file" data-test="export-button" onClick={this.downloadTxtFile}>
            Export
          </button>
          {this.renderCopyToClipboardButton()}
          <button className="history border py-1 cursor-pointer" title="History" data-test="history-button" onClick={this.props.onToggleHistory}>
            History
          </button>
          <a className="border text-center py-1" href={npcDataUrl.toString()} data-test="bookmark-button">
            🔗 Bookmark
          </a>
        </div>
        <Footer />
      </div>
    );
  }
}
