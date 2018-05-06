<template>
	<span class="ui-checkbox">
		<input type="checkbox" :checked="checked?'checked':''" @change="onChangeHandler" />
		<span class="icon">
			<i class="tbzico ico-ok"></i>
		</span>
		<span class="label">
      <span>{{title}}</span>
    </span>

	</span>
</template>
<script>
export default {
  props: ["title", "checked"],
  methods: {
    onChangeHandler() {
      this.$emit("onChange", !this.$props.checked);
    }
  }
};
</script>
<style lang="scss">
.ui-checkbox {
  position: relative;
  padding-top: 3px;
  input[type="checkbox"] {
    opacity: 0;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    cursor: pointer;
    &:checked + span {
      transform: scale(1);
    }
  }
  .label {
    color: #515151;
    padding-left: 20px;
    font-size: 12px;
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 4px;
      width: 16px;
      height: 16px;
      border: 1px solid #adadad;
      border-radius: 3px;
      background: #fff;
      pointer-events: none;
    }
  }
  .icon {
    transform: scale(0);
    transition: all 0.1s;
    position: absolute;
    left: 2px;
    top: 3px;
    z-index: 100;
    pointer-events: none;
    i {
      color: #00a2eb;
      font-size: 12px;
    }
  }
}
</style>



// WEBPACK FOOTER //
// checkbox.vue?a6594180