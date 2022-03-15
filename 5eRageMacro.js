let actorD = game.user.character ?? canvas.tokens.controlled[0].actor;
let level = actorD.data.data.details.cr ?? actorD.classes.barbarian.data.data.levels;
let gameRound = game.combat ? game.combat.round : 0;
let itemD = actorD.items.getName("Rage");
let the_message = "";
//Absolutely no idea why this needs to be a duplicate but whatever. I'm fucking tired of js already
let actorUpdateData = duplicate(actorD);
let rages = actorUpdateData.data.resources.primary.value;

//Construct Chat message in a function to reduce excessive code
function SendIt(message) {
    ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({
            actor: actorD
        }),
        content: message,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE
    })
}
//If I have rages or am currently raging
if (rages >= 1 || actorD.effects.find(i => i.data.label === "Rage")) {
    //If already Raging, cancel it. Otherwise prompt for mutation option and enable DAE rage
    if (actorD.effects.find(i => i.data.label === "Rage")) {
        let rage_id = await actorD.effects.find(i => i.data.label === "Rage").id;
        await actorD.deleteEmbeddedDocuments("ActiveEffect", [rage_id]);
        the_message = `<em>${actorD.name}'s Rage wears off.</em>`;
        SendIt(the_message)
    } else {
        let namedfields = (...fields) => {
            return (...arr) => {
                var obj = {};
                fields.forEach((field, index) => {
                    obj[field] = arr[index];
                });
                return obj;
            };
        };

        let mutation = namedfields('name', 'flavormessage')
        var mutations = [
            mutation('Mouth', ' a grotesque set of mandibles, draining his enemies for energy'),
            mutation('Clamps', ' a pair of clamps *click clack*'),
            mutation('Tail', ' one sexy ass tail, making him harder to hit')
        ];
        let applyChanges = false;
        new Dialog({
            title: `Select Mutation`,
            content: `
      
      <form>
        <div class="form-group">
          <label>Choose Mutation:</label>
          <select id="Mutation" name="Mutation">
            ${mutations.map((mutation, index) => {
                return `\t<option value=${index}>${mutation.name}</option>`;
            }).join('\n')
                }
          </select>
        </div>
      </form>
      `,

            buttons: {
                yes: {
                    icon: "<i class='fas fa-check'></i>",
                    label: `Apply Rage`,
                    callback: () => applyChanges = true
                },
                no: {
                    icon: "<i class='fas fa-times'></i>",
                    label: `Cancel Rage`
                },
            },

            default: "yes",
            close: html => {
                if (applyChanges) {
                    let mutationindex = parseInt(html.find('[name="Mutation"]')[0].value || 0);

                    let mutationname = mutations[mutationindex].name;
                    let mutationflavor = mutations[mutationindex].flavormessage;

                    //debug logging
                    //console.log(mutationname);

                    let effectData = {
                        label: itemD.name,
                        icon: itemD.img,
                        disabled: false,
                        duration: {
                            rounds: 10,
                            seconds: 60,
                            startRound: gameRound,
                            startTime: game.time.worldTime
                        },
                        origin: itemD.uuid,
                        changes: [{
                            "key": "data.bonuses.mwak.damage",
                            "value": `+${(Math.ceil(Math.floor(level / (9 - (Math.floor(level / 9))) + 2)))}`,
                            "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            "priority": 20
                        },
                        {
                            "key": "data.traits.dr.value",
                            "value": "slashing",
                            "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            "priority": 20
                        },
                        {
                            "key": "data.traits.dr.value",
                            "value": "bludgeoning",
                            "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            "priority": 20
                        },
                        {
                            "key": "data.traits.dr.value",
                            "value": "piercing",
                            "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            "priority": 20
                        }
                        ]
                    }
                    //await actorD.createEmbeddedDocuments("ActiveEffect", [effectData]);
                    actorD.createEmbeddedDocuments("ActiveEffect", [effectData]);
                    the_message = `<em>${actor.name} starts to Rage! Mutating into a horrid beast with ${mutationflavor}</em>`;

                    //debug logging
                    //console.log(rages + " Rages Remaining");

                    SendIt(the_message);
                    actorUpdateData.data.resources.primary.value -= 1; //reduces rages by 1
                    //Still no idea why this needs to be a fucking duplicate
                    actorD.update(actorUpdateData);
                }
            }
        }).render(true);

    }
} else {
    let the_message = "Grozdan needs a nap"
    SendIt(the_message)
};
