<script setup lang="ts">
import {NButton} from 'naive-ui';
</script>

<template>
<div class="input_container box_shadow_level_one hoverable">
    <div class="input_inner">
        <div class="input_wrap">
            <input id="input_box" type="text"></input>
        </div>
        <div class="side_buttons">
            <div class="side_button">                <NButton></NButton></div>
            <div class="side_button">                <NButton></NButton></div>
        </div>
    </div>
</div>
</template>

<style scope>
.input_container   {
        display:block;
        max-width: 50%;
        min-width: 500px;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        background-color: var(--item-bg);
        padding: 12px 24px;

}
.input_inner {
    height:48px;
    display:flex;
    flex-direction:row;
    flex-wrap:nowrap;
}

.input_wrap {
    display:flex;
    flex-grow:1;
    align-items:center;
}

#input_box {
    height:42px;
    width:100%;
    padding:4px 8px;
}

#input_box,#input_box:active,#input_box:hover,#input_box:focus,#input_box:focus-visible{
    border:0px solid;
    outline: none;
}

.side_buttons {
    margin-left:1rem;
    display:flex;
    flex-direction:row;
    flex-wrap: nowrap;
}

.side_button{
    margin:4px;
    display: flex;
    flex-direction:row;
    flex-wrap: nowrap;
    justify-content:center;
    align-items:center;
}
</style>