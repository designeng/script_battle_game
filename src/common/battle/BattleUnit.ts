import {BattleSide} from './BattleSession';
import {CharactersList, ICharacterConfig} from "../characters/CharactersList";
import {Inject} from "../InjectDectorator";
import {BattleFieldDrawer} from "./BattleFieldDrawer";
import {IAction} from "../codeSandbox/CodeSandbox";
import {getBattleApi} from "./BattleUnitBattleApi";

interface IBattleUnitConfig {
    x: number;
    y: number;
    id: string,
    type: string,
    side: BattleSide,
    scene: Phaser.Scene;
}

type IAnimationName = 'idle' | 'slash' | 'shoot' | 'walk' | 'thrust' | 'spellcast';

export class BattleUnit {
    x: number;
    y: number;
    id: string;

    hasTurn = true;
    health = 100;
    side: BattleSide;

    character: ICharacterConfig;
    actions: IAction[] = [];

    api: any;

    @Inject(CharactersList) private charactersList: CharactersList;
    @Inject(BattleFieldDrawer) private battleFieldDrawer: BattleFieldDrawer;

    private scene: Phaser.Scene;
    private type: string;
    private sprite: Phaser.GameObjects.Sprite;
    private sayText: Phaser.GameObjects.Text;
    private container: any;

    get renderLeft(): number {
        return this.battleFieldDrawer.getHexagonLeft(this.x, this.y) - 32;
    }

    get renderTop(): number {
        return this.battleFieldDrawer.getHexagonTop(this.x, this.y) + 8;
    }

    constructor(config: IBattleUnitConfig) {
        this.x = config.x;
        this.y = config.y;

        this.id = config.id;
        this.side = config.side;
        this.scene = config.scene;
        this.type = config.type;

        this.character = this.charactersList.get(config.type);

        this.initGraphics();

        this.api = getBattleApi(this);

    }

    setActions(actions: IAction[]) {
        this.actions = actions.slice(0);
    }

    setPositionAction(x: number, y: number): Promise<void> {
        this.x = Math.max(0, x + this.x);
        this.y = Math.max(0, y + this.y);

        this.container.setPosition(this.renderLeft, this.renderTop);

        this.setAnimation('walk');

        return new Promise(resolve => {
            setTimeout(() => {
                this.setAnimation('idle');
                resolve();
            }, 300);
        });
    }

    sayAction(text: string): Promise<void> {
        return new Promise(resolve => {
            this.sayText.setText(text);
            this.sayText.setVisible(true);

            setTimeout(() => {

                resolve();
            }, 300);

            setTimeout(() => {
                this.sayText.setVisible(false);
            }, 2000);
        });
    }

    private setAnimation(animationName: IAnimationName) {
        const turnKey = this.side === BattleSide.right ? 'left' : 'right';
        const phaserAnimationName = `${this.type}_${animationName}_${turnKey}`;

        this.sprite.play(phaserAnimationName, false, 0);
    }

    private initGraphics() {
        this.container = (this.scene.add as any).container(this.renderLeft, this.renderTop);
        this.sprite = this.generateSprite();
        const idText = this.generateIdText();
        this.sayText = this.generateSayText();
        const healthBar = this.generateHealthBar();

        this.container.add(this.sprite);
        this.container.add(this.sayText);
        this.container.add(idText);
        this.container.add(healthBar);

        this.setAnimation('idle');
    }

    private generateSprite(): Phaser.GameObjects.Sprite {
        return this.scene.add.sprite(0, -20, this.type);
    }

    private generateIdText(): Phaser.GameObjects.Text {
        const isLeft = this.side === BattleSide.left;
        const left = isLeft ? 10 : -10;

        const idText = this.scene.add.text(left, 4, this.id, {
            font: '9px monospace',
            color: '#11cc14',
            backgroundColor: '#42176c'
        });

        if (isLeft) {
            idText.setOrigin(0, 0.5);
        } else {
            idText.setOrigin(1, 0.5);
        }

        idText.setPadding(2, 1, 2, 0);

        return idText;
    }

    private generateSayText(): Phaser.GameObjects.Text {
        const isLeft = this.side === BattleSide.left;
        const left = isLeft ? 10 : -10;

        const textElement = this.scene.add.text(left, -32, '', {
            font: '9px monospace',
            color: '#111111',
            backgroundColor: '#faffac'
        });

        if (isLeft) {
            textElement.setOrigin(0, 1);
        } else {
            textElement.setOrigin(1, 1);
        }

        textElement.setPadding(2, 1, 2, 0);
        textElement.setVisible(false);

        return textElement;
    }

    private generateHealthBar(): Phaser.GameObjects.Graphics {
        const width = 40;
        const graphics = this.scene.add.graphics();

        graphics.fillStyle(0x00ff00, 1);
        graphics.fillRect(-(width / 2), 12, width, 2);
        graphics.lineStyle(1, 0x11cc14, 1);
        graphics.strokeRect(-(width / 2), 12, width, 2);

        return graphics;
    }
}