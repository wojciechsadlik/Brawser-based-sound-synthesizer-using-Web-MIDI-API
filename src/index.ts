import MIDI_Communicator from './MIDI_Communicator';
import SoundGenerator from './SoundGenerator';
import Oscilloscope from './Oscilloscope';
import WaveformData from './WaveformData';

const midiInputSelectElem = document.getElementById('MIDI_Input_sel') as HTMLSelectElement;
const addWaveformBtnElem = document.getElementById('add_waveform_btn') as HTMLButtonElement;
const waveformsTableElem = document.getElementById('waveforms') as HTMLTableElement;
const masterVolumeElem = document.getElementById('masterVolume') as HTMLInputElement;
const compressorCheckElem = document.getElementById('compressorToggle') as HTMLInputElement;

const audioContext = new window.AudioContext();
const soundGenerator = new SoundGenerator(audioContext);
const oscilloscope = new Oscilloscope(audioContext);

window.addEventListener('click', resumeAudioContext);

const midiCommunicator = new MIDI_Communicator();
midiCommunicator.init(midiInputSelectElem);
midiCommunicator.connectSoundGenerator(soundGenerator);

midiInputSelectElem.addEventListener('change', inputSelectChange);

addWaveformBtnElem.addEventListener('click', addWaveform);

masterVolumeElem.addEventListener('change', volumeChange);

compressorCheckElem.addEventListener('change', compressorCheckChange);

function inputSelectChange() {
    midiCommunicator.setSelectedInput(midiInputSelectElem.value);
}

function volumeChange(this: HTMLInputElement) {
    if (this.id === 'masterVolume')
        soundGenerator.setMasterVolume(Number(this.value));
    else {
        let rowId = this.parentElement!.parentElement!.id
        soundGenerator.setVolume(Number(rowId), Number(this.value));
    }
}

function delayChange(this: HTMLInputElement) {
    let rowId = this.parentElement!.parentElement!.id
    soundGenerator.setDelay(Number(rowId), Number(this.value));
}

function waveformChange(this: HTMLSelectElement) {
    let rowId = this.parentElement!.parentElement!.id
    soundGenerator.setWaveType(Number(rowId), this.value as OscillatorType);
}

function compressorCheckChange(this: HTMLInputElement) {
    soundGenerator.setCompressorOn(this.checked);
}

function resumeAudioContext() {
    audioContext.resume().then(() => {
        console.log('Audio context resumed successfully');
        
        window.removeEventListener('click', resumeAudioContext);
    });
}

function addWaveform() {
    let lastChild = waveformsTableElem.lastElementChild;
    let id = ((lastChild) ? Number(lastChild.id) + 1 : 0);
    let waveformSelector = createWaveformSelector(id);
    waveformsTableElem.appendChild(waveformSelector);
    let waveform: WaveformData = {type: 'square', volume: 0.5, delay: 0.0};
    soundGenerator.addWaveform(Number(waveformSelector.id), waveform);
}

function removeWaveform(this: HTMLButtonElement) {
    let row = this.parentElement!.parentElement!

    soundGenerator.removeWaveform(Number(row.id));
    waveformsTableElem.removeChild(row as Node);
}

function createWaveformSelector(id: number): HTMLTableRowElement {
    let tableRow = document.createElement('tr');
    tableRow.id = id.toString();

    let wavetype = document.createElement('td');
    let selector = document.createElement('select');
    addWaveforms(selector);
    selector.addEventListener('change', waveformChange);
    wavetype.append(selector);

    let volume = document.createElement('td');
    let volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.01';
    volumeSlider.value = '0.5';
    volumeSlider.addEventListener('change', volumeChange);
    volume.append(volumeSlider);

    let delay = document.createElement('td');
    let delaySlider = document.createElement('input');
    delaySlider.type = 'range';
    delaySlider.min = '0';
    delaySlider.max = '1';
    delaySlider.step = '0.01';
    delaySlider.value = '0';
    delaySlider.addEventListener('change', delayChange);
    delay.append(delaySlider);

    let remove = document.createElement('td');
    let removeBtn = document.createElement('button');
    removeBtn.appendChild(document.createTextNode('remove'));
    removeBtn.addEventListener('click', removeWaveform);
    remove.append(removeBtn);

    tableRow.appendChild(wavetype);
    tableRow.appendChild(volume);
    tableRow.appendChild(delay);
    tableRow.appendChild(remove);

    return tableRow;
}

function addWaveforms(selector: HTMLSelectElement) {
    let waveforms = ['square',
        'sawtooth',
        'triangle',
        'sine']

    for (let waveform of waveforms) {
        let option = document.createElement('option');
        option.text = waveform;
        option.value = waveform;
        selector.add(option);
    }
}