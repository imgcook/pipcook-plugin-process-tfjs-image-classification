import { ImageDataSourceMeta, Sample, Script } from '@pipcook/pipcook-core';

const { generateDataFlow } = Script;


const metaProcessor: Script.MetaProcessor = async (api, options, context) => {
  const [x='-1', y='-1'] = options['size'];
  const parsedX = parseInt(x);
  const parsedY = parseInt(y);
  if (parsedX == -1 || parsedY == -1) return;
  const oldMeta = await api.getDataSourceMeta() as ImageDataSourceMeta;
  return {
    ... oldMeta,
    dimension: {
      x,
      y,
      z: oldMeta.dimension.z
    }
  }
}

// @ts-ignore
const sampleProcessor: Script.SampleProcessor<DataCookImage, tf.Tensor3D> = async (sample: Sample<DataCookImage>, options, context) => {
  const {data, label} = sample
  const [x='-1', y='-1'] = options['size'];
  const parsedX = parseInt(x);
  const parsedY = parseInt(y);
  if (parsedX == -1 || parsedY == -1) return;
  const resized = data.resize(parsedX, parsedY);
  const { normalize = false } = options;
  if (normalize) return {
    data: context.dataCook.Image.normalize(resized.toTensor()),
    label
  }
  return {
    data: resized.toTensor(),
    label
  }
}

/**
 * this is the data process plugin to process pasvoc format data. It supports resize the image and normalize the image
 * @param resize =[256, 256][optional] resize all images to same size
 * @param normalize =false[optional] if normalize all images to have values between [0, 1]
 */


export default generateDataFlow(sampleProcessor, metaProcessor);
