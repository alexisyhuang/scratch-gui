import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';
import PaintEditor from 'scratch-paint';
import { inlineSvgFonts } from 'scratch-svg-renderer';

import { connect } from 'react-redux';

class PaintEditorWrapper extends React.Component {
    constructor(props) {
        super(props);
        bindAll(this, [
            'handleUpdateImage',
            'handleUpdateName'
        ]);
    }

    shouldComponentUpdate(nextProps) {
        return this.props.imageId !== nextProps.imageId ||
            this.props.rtl !== nextProps.rtl ||
            this.props.name !== nextProps.name
    }

    handleUpdateName(name) {
        this.props.vm.renameCostume(this.props.selectedCostumeIndex, name);
    }

    handleUpdateImage(isVector, image, rotationCenterX, rotationCenterY) {
        if (isVector) {
            this.props.vm.updateSvg(
                this.props.selectedCostumeIndex,
                image,
                rotationCenterX,
                rotationCenterY
            );
        } else {
            this.props.vm.updateBitmap(
                this.props.selectedCostumeIndex,
                image,
                rotationCenterX,
                rotationCenterY,
                2 /* bitmapResolution */
            );
        }
    }

    render() {
        if (!this.props.imageId) return null;

        const {
            selectedCostumeIndex,
            previousCostumeIndex,
            vm,
            ...componentProps
        } = this.props;

        const currentCostume = vm.getCostume(selectedCostumeIndex);
        const previousCostume = previousCostumeIndex !== null ? vm.getCostume(previousCostumeIndex) : null;
        // this line below flopped
        // const previousCostumeFormat = state.scratchGui.vm.editingTarget.sprite.costumes[previousCostumeIndex].dataFormat;

        // console.log('PaintEditorWrapper Props:', componentProps);
        // console.log('currentCostume:', currentCostume);
        // console.log('previousCostume:', previousCostume);
        // console.log('previous costume format???, ', previousCostumeFormat)

        return (
            <PaintEditor
                {...componentProps}
                image={currentCostume}
                previousCostume={previousCostume}
                onUpdateImage={this.handleUpdateImage}
                onUpdateName={this.handleUpdateName}
                fontInlineFn={inlineSvgFonts}
            />
        );
    }
}

PaintEditorWrapper.propTypes = {
    imageFormat: PropTypes.string.isRequired,
    imageId: PropTypes.string.isRequired,
    name: PropTypes.string,
    rotationCenterX: PropTypes.number,
    rotationCenterY: PropTypes.number,
    rtl: PropTypes.bool,
    selectedCostumeIndex: PropTypes.number.isRequired,
    vm: PropTypes.instanceOf(VM),
    previousCostumeIndex: PropTypes.number.isRequired,
};

const mapStateToProps = (state, { selectedCostumeIndex }) => {
    const targetId = state.scratchGui.vm.editingTarget.id;
    const sprite = state.scratchGui.vm.editingTarget.sprite;
    // Make sure the costume index doesn't go out of range.
    const index = selectedCostumeIndex < sprite.costumes.length ?
        selectedCostumeIndex : sprite.costumes.length - 1;
    const costume = state.scratchGui.vm.editingTarget.sprite.costumes[index];
    const previousCostumeIndex = index > 0 ? index - 1 : null;
    const previousCostume = previousCostumeIndex !== null ? sprite.costumes[previousCostumeIndex] : null;

    return {
        name: costume && costume.name,
        rotationCenterX: costume && costume.rotationCenterX,
        rotationCenterY: costume && costume.rotationCenterY,
        imageFormat: costume && costume.dataFormat,
        imageId: targetId && `${targetId}${costume.skinId}`,
        rtl: state.locales.isRtl,
        selectedCostumeIndex: index,
        vm: state.scratchGui.vm,
        zoomLevelId: targetId,
        // previousCostume: previousCostume && { index: previousCostumeIndex, ...previousCostume },
        previousCostumeIndex: previousCostumeIndex,
        prevRotationCenterX: previousCostume && previousCostume.rotationCenterX,
        prevRotationCenterY: previousCostume && previousCostume.rotationCenterY,
        prevImageFormat: previousCostume && previousCostume.dataFormat,
        
    };
};

export default connect(mapStateToProps)(PaintEditorWrapper);
