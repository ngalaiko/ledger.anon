import { Module, type Changelog, State, type ConfigDto } from 'mm-jsr';

export interface ModuleSliderDistanceSettings {
  /**
   * Minimum distance between sliders.
   */
  minimum: number;
}

/**
 * Module responsible for limiting neighboring values.
 */
export class ModuleSliderDistance extends Module {
  private readonly _settings: ModuleSliderDistanceSettings;

  constructor(settings: Partial<ModuleSliderDistanceSettings> = { minimum: 0 }) {
    super();

    this._settings = Object.assign(
      {
        minimum: Number
      },
      settings
    );
  }

  public update(config: ConfigDto, state: State, changelog: Changelog): State {
    const { values } = state;

    console.log(this._settings, values);

    return state.updateValues(values);
  }
}
